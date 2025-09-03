from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sqlite3
from contextlib import contextmanager
from typing import List, Optional

DB_PATH = "./simple.db"

@contextmanager
def get_db():
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	try:
		yield conn
	finally:
		conn.commit()
		conn.close()

app = FastAPI(title="Construction Simple API")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)

# bootstrap schema
with get_db() as db:
	db.executescript(
		"""
		CREATE TABLE IF NOT EXISTS projects (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			start_date TEXT,
			end_date TEXT
		);
		CREATE TABLE IF NOT EXISTS partners (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS project_partners (
			project_id INTEGER NOT NULL,
			partner_id INTEGER NOT NULL,
			percentage REAL NOT NULL,
			PRIMARY KEY (project_id, partner_id)
		);
		CREATE TABLE IF NOT EXISTS phases (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			project_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			planned_amount REAL
		);
		CREATE TABLE IF NOT EXISTS suppliers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS materials (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			project_id INTEGER NOT NULL,
			phase_id INTEGER NOT NULL,
			supplier_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			quantity REAL NOT NULL,
			unit TEXT,
			unit_price REAL NOT NULL,
			total REAL NOT NULL
		);
		CREATE TABLE IF NOT EXISTS treasury (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			project_id INTEGER NOT NULL,
			direction TEXT NOT NULL CHECK(direction IN ('in','out')),
			amount REAL NOT NULL,
			tx_date TEXT DEFAULT (DATE('now')),
			partner_id INTEGER,
			supplier_id INTEGER,
			phase_id INTEGER,
			material_id INTEGER,
			method TEXT,
			notes TEXT
		);
		"""
	)

class ProjectCreate(BaseModel):
	name: str = Field(..., min_length=1)
	start_date: Optional[str] = None
	end_date: Optional[str] = None

class Project(BaseModel):
	id: int
	name: str
	start_date: Optional[str]
	end_date: Optional[str]

@app.post("/projects", response_model=Project)
def create_project(body: ProjectCreate):
	with get_db() as db:
		cur = db.execute(
			"INSERT INTO projects(name,start_date,end_date) VALUES (?,?,?)",
			(body.name, body.start_date, body.end_date),
		)
		pid = cur.lastrowid
		row = db.execute("SELECT id,name,start_date,end_date FROM projects WHERE id=?", (pid,)).fetchone()
		return Project(**dict(row))

@app.get("/projects", response_model=List[Project])
def list_projects():
	with get_db() as db:
		rows = db.execute("SELECT id,name,start_date,end_date FROM projects ORDER BY id DESC").fetchall()
		return [Project(**dict(r)) for r in rows]


# ---------------- Partners ----------------
class PartnerItem(BaseModel):
	name: str
	percentage: float = Field(ge=0)

@app.get("/projects/{project_id}/partners")
def get_partners(project_id: int):
	with get_db() as db:
		rows = db.execute(
			"""
			SELECT pp.partner_id, p.name AS partner_name, pp.percentage
			FROM project_partners pp
			JOIN partners p ON p.id = pp.partner_id
			WHERE pp.project_id = ?
			ORDER BY p.id
			""",
			(project_id,),
		).fetchall()
		return [dict(r) for r in rows]

@app.post("/projects/{project_id}/partners")
def set_partners(project_id: int, items: List[PartnerItem]):
	if not items:
		raise HTTPException(status_code=400, detail="قائمة الشركاء فارغة")
		total = 0
	for it in items:
		total += it.percentage
	if abs(total - 100.0) > 0.01:
		raise HTTPException(status_code=400, detail="النسب يجب أن تساوي 100")
	with get_db() as db:
		# ensure project exists
		pr = db.execute("SELECT id FROM projects WHERE id=?", (project_id,)).fetchone()
		if not pr:
			raise HTTPException(status_code=404, detail="المشروع غير موجود")
		# clear and insert
		db.execute("DELETE FROM project_partners WHERE project_id=?", (project_id,))
		for it in items:
			row = db.execute("SELECT id FROM partners WHERE name=?", (it.name,)).fetchone()
			if row:
				pid = row[0]
			else:
				pid = db.execute("INSERT INTO partners(name) VALUES (?)", (it.name,)).lastrowid
			db.execute(
				"INSERT OR REPLACE INTO project_partners(project_id,partner_id,percentage) VALUES (?,?,?)",
				(project_id, pid, it.percentage),
			)
	return {"ok": True}


# ---------------- Phases ----------------
class PhaseCreate(BaseModel):
	name: str
	planned_amount: Optional[float] = None

@app.get("/projects/{project_id}/phases")
def list_phases(project_id: int):
	with get_db() as db:
		rows = db.execute(
			"SELECT id, project_id, name, planned_amount FROM phases WHERE project_id=? ORDER BY id",
			(project_id,),
		).fetchall()
		return [dict(r) for r in rows]

@app.post("/projects/{project_id}/phases")
def create_phase(project_id: int, body: PhaseCreate):
	with get_db() as db:
		pr = db.execute("SELECT id FROM projects WHERE id=?", (project_id,)).fetchone()
		if not pr:
			raise HTTPException(status_code=404, detail="المشروع غير موجود")
		pid = db.execute(
			"INSERT INTO phases(project_id,name,planned_amount) VALUES (?,?,?)",
			(project_id, body.name, body.planned_amount),
		).lastrowid
		row = db.execute("SELECT id, project_id, name, planned_amount FROM phases WHERE id=?", (pid,)).fetchone()
		return dict(row)


# ---------------- Materials & Suppliers ----------------
class MaterialCreate(BaseModel):
	supplier_name: str
	name: str
	quantity: float
	unit: Optional[str] = None
	unit_price: float

@app.get("/projects/{project_id}/phases/{phase_id}/materials")
def list_materials(project_id: int, phase_id: int):
	with get_db() as db:
		rows = db.execute(
			"""
			SELECT m.id, m.name, m.quantity, m.unit, m.unit_price, m.total,
			       s.id AS supplier_id, s.name AS supplier_name
			FROM materials m
			JOIN suppliers s ON s.id = m.supplier_id
			WHERE m.project_id=? AND m.phase_id=?
			ORDER BY m.id
			""",
			(project_id, phase_id),
		).fetchall()
		return [dict(r) for r in rows]

@app.post("/projects/{project_id}/phases/{phase_id}/materials")
def add_material(project_id: int, phase_id: int, body: MaterialCreate):
	if body.quantity <= 0 or body.unit_price < 0:
		raise HTTPException(status_code=400, detail="قيمة غير صحيحة")
	with get_db() as db:
		ph = db.execute("SELECT id FROM phases WHERE id=? AND project_id=?", (phase_id, project_id)).fetchone()
		if not ph:
			raise HTTPException(status_code=404, detail="المرحلة غير موجودة")
		sr = db.execute("SELECT id FROM suppliers WHERE name=?", (body.supplier_name,)).fetchone()
		if sr:
			supplier_id = sr[0]
		else:
			supplier_id = db.execute("INSERT INTO suppliers(name) VALUES (?)", (body.supplier_name,)).lastrowid
		total = body.quantity * body.unit_price
		mid = db.execute(
			"INSERT INTO materials(project_id,phase_id,supplier_id,name,quantity,unit,unit_price,total) VALUES (?,?,?,?,?,?,?,?)",
			(project_id, phase_id, supplier_id, body.name, body.quantity, body.unit, body.unit_price, total),
		).lastrowid
		row = db.execute("SELECT id, name, quantity, unit, unit_price, total FROM materials WHERE id=?", (mid,)).fetchone()
		return dict(row)


# ---------------- Treasury ----------------
class ReceiptCreate(BaseModel):
	partner_name: str
	amount: float = Field(gt=0)
class PaymentCreate(BaseModel):
	supplier_name: str
	amount: float = Field(gt=0)
	phase_id: Optional[int] = None

def compute_balance(db, project_id: int) -> float:
	inn = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='in'", (project_id,)).fetchone()[0]
	out = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='out'", (project_id,)).fetchone()[0]
	return float(inn or 0) - float(out or 0)

@app.get("/projects/{project_id}/treasury/balance")
def treasury_balance(project_id: int):
	with get_db() as db:
		return {"treasuryBalance": compute_balance(db, project_id)}

@app.get("/projects/{project_id}/treasury/transactions")
def treasury_list(project_id: int):
	with get_db() as db:
		rows = db.execute(
			"""
			SELECT t.*, p.name AS partner_name, s.name AS supplier_name
			FROM treasury t
			LEFT JOIN partners p ON p.id = t.partner_id
			LEFT JOIN suppliers s ON s.id = t.supplier_id
			WHERE t.project_id=?
			ORDER BY t.id DESC
			""",
			(project_id,),
		).fetchall()
		return [dict(r) for r in rows]

@app.post("/projects/{project_id}/treasury/receipts")
def add_receipt(project_id: int, body: ReceiptCreate):
	with get_db() as db:
		pr = db.execute("SELECT id FROM projects WHERE id=?", (project_id,)).fetchone()
		if not pr:
			raise HTTPException(status_code=404, detail="المشروع غير موجود")
		row = db.execute("SELECT id FROM partners WHERE name=?", (body.partner_name,)).fetchone()
		partner_id = row[0] if row else db.execute("INSERT INTO partners(name) VALUES (?)", (body.partner_name,)).lastrowid
		db.execute(
			"INSERT INTO treasury(project_id,direction,amount,partner_id) VALUES (?,?,?,?)",
			(project_id, 'in', body.amount, partner_id),
		)
		return {"ok": True}

@app.post("/projects/{project_id}/treasury/payments")
def add_payment(project_id: int, body: PaymentCreate):
	with get_db() as db:
		pr = db.execute("SELECT id FROM projects WHERE id=?", (project_id,)).fetchone()
		if not pr:
			raise HTTPException(status_code=404, detail="المشروع غير موجود")
		bal = compute_balance(db, project_id)
		if bal - body.amount < 0:
			raise HTTPException(status_code=400, detail="رصيد غير كافٍ")
		sr = db.execute("SELECT id FROM suppliers WHERE name=?", (body.supplier_name,)).fetchone()
		supplier_id = sr[0] if sr else db.execute("INSERT INTO suppliers(name) VALUES (?)", (body.supplier_name,)).lastrowid
		db.execute(
			"INSERT INTO treasury(project_id,direction,amount,supplier_id,phase_id) VALUES (?,?,?,?,?)",
			(project_id, 'out', body.amount, supplier_id, body.phase_id),
		)
		return {"ok": True}


# ---------------- Settlement & Reports ----------------
@app.post("/projects/{project_id}/settlements/run")
def run_settlement(project_id: int, phase_id: int):
	with get_db() as db:
		# phase cost
		cost = db.execute("SELECT COALESCE(SUM(total),0) FROM materials WHERE project_id=? AND phase_id=?", (project_id, phase_id)).fetchone()[0] or 0
		# partners
		partners = db.execute(
			"SELECT p.name, pp.percentage FROM project_partners pp JOIN partners p ON p.id=pp.partner_id WHERE pp.project_id=?",
			(project_id,),
		).fetchall()
		# paid to date by partner (receipts)
		paid_rows = db.execute(
			"SELECT partner_id, COALESCE(SUM(amount),0) AS amt FROM treasury WHERE project_id=? AND direction='in' GROUP BY partner_id",
			(project_id,),
		).fetchall()
		paid_map = {r[0]: r[1] for r in paid_rows}
		# map partner name to id
		name_to_id = {r[0]: db.execute("SELECT id FROM partners WHERE name=?", (r[0],)).fetchone()[0] for r in partners}
		result = []
		for r in partners:
			name, perc = r[0], float(r[1])
			amount_due = (float(cost) * perc) / 100.0
			pid = name_to_id.get(name)
			amount_paid = float(paid_map.get(pid, 0) or 0)
			delta = amount_due - amount_paid
			status = 'needs_to_pay' if delta > 0 else ('needs_refund' if delta < 0 else 'settled')
			result.append({
				"partnerName": name,
				"amountDue": round(amount_due, 2),
				"amountPaidToDate": round(amount_paid, 2),
				"delta": round(delta, 2),
				"settlementStatus": status,
			})
		return result

@app.get("/projects/{project_id}/reports/treasury")
def report_treasury(project_id: int):
	with get_db() as db:
		incoming = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='in'", (project_id,)).fetchone()[0] or 0
		outgoing = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='out'", (project_id,)).fetchone()[0] or 0
		return {"incoming": float(incoming), "outgoing": float(outgoing), "balance": float(incoming) - float(outgoing)}

@app.get("/projects/{project_id}/reports/suppliers")
def report_suppliers(project_id: int, phase_id: Optional[int] = None):
	with get_db() as db:
		if phase_id:
			rows = db.execute(
				"""
				SELECT supplier_id, s.name AS supplier_name, COALESCE(SUM(amount),0) AS paid
				FROM treasury t JOIN suppliers s ON s.id=t.supplier_id
				WHERE t.project_id=? AND t.direction='out' AND t.phase_id=?
				GROUP BY supplier_id, s.name
				""",
				(project_id, phase_id),
			).fetchall()
		else:
			rows = db.execute(
				"""
				SELECT supplier_id, s.name AS supplier_name, COALESCE(SUM(amount),0) AS paid
				FROM treasury t JOIN suppliers s ON s.id=t.supplier_id
				WHERE t.project_id=? AND t.direction='out'
				GROUP BY supplier_id, s.name
				""",
				(project_id,),
			).fetchall()
		return [dict(r) for r in rows]