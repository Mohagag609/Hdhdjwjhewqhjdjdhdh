import streamlit as st
import sqlite3
from contextlib import contextmanager

DB_PATH = "one_app.db"

@contextmanager
def get_db():
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	try:
		yield conn
	finally:
		conn.commit()
		conn.close()

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

def compute_balance(db, project_id: int) -> float:
	inn = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='in'", (project_id,)).fetchone()[0]
	out = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='out'", (project_id,)).fetchone()[0]
	return float(inn or 0) - float(out or 0)

st.set_page_config(page_title="Construction Manager", layout="wide")
st.title("برنامج إدارة مشاريع البناء - نسخة مبسطة")

# Sidebar - projects
st.sidebar.header("المشاريع")
with st.sidebar.form("create_project_form", clear_on_submit=True):
	pname = st.text_input("اسم المشروع")
	submitted = st.form_submit_button("إنشاء مشروع")
	if submitted and pname.strip():
		with get_db() as db:
			db.execute("INSERT INTO projects(name) VALUES (?)", (pname.strip(),))
			st.success("تم إنشاء المشروع")

with get_db() as db:
	projects = db.execute("SELECT id,name FROM projects ORDER BY id DESC").fetchall()
project_options = {f"#{p['id']} - {p['name']}": p['id'] for p in projects}
project_label = st.sidebar.selectbox("اختر مشروع", list(project_options.keys())) if project_options else None
project_id = project_options.get(project_label) if project_label else None

if not project_id:
	st.info("أنشئ مشروعًا أولًا من الشريط الجانبي")
	st.stop()

# Tabs
Tabs = st.tabs(["الشركاء", "المراحل", "البنود", "الخزينة", "التسوية", "التقارير"])

# شركاء
with Tabs[0]:
	st.subheader("الشركاء ونِسبهم")
	with get_db() as db:
		rows = db.execute(
			"SELECT pp.partner_id, p.name, pp.percentage FROM project_partners pp JOIN partners p ON p.id=pp.partner_id WHERE pp.project_id=?",
			(project_id,),
		).fetchall()
		current = [{"name": r["name"], "percentage": r["percentage"]} for r in rows]

	edited = st.data_editor(current + ([{"name":"","percentage":0}] if not current else []), num_rows="dynamic")
	if st.button("حفظ النسب"):
		total = sum(float(it.get("percentage") or 0) for it in edited)
		if abs(total - 100.0) > 0.01:
			st.error("إجمالي النسب يجب أن يساوي 100")
		else:
			with get_db() as db:
				db.execute("DELETE FROM project_partners WHERE project_id=?", (project_id,))
				for it in edited:
					name = (it.get("name") or "").strip()
					perc = float(it.get("percentage") or 0)
					if not name:
						continue
					row = db.execute("SELECT id FROM partners WHERE name=?", (name,)).fetchone()
					pid = row[0] if row else db.execute("INSERT INTO partners(name) VALUES (?)", (name,)).lastrowid
					db.execute("INSERT OR REPLACE INTO project_partners(project_id,partner_id,percentage) VALUES (?,?,?)", (project_id, pid, perc))
			st.success("تم الحفظ")

# مراحل
with Tabs[1]:
	st.subheader("المراحل")
	with get_db() as db:
		phases = db.execute("SELECT id,name,planned_amount FROM phases WHERE project_id=?", (project_id,)).fetchall()
	st.table([{"id": ph["id"], "name": ph["name"], "planned": ph["planned_amount"]} for ph in phases])
	c1, c2 = st.columns(2)
	with c1:
		new_phase_name = st.text_input("اسم المرحلة", key="phase_name")
	with c2:
		new_phase_amount = st.number_input("المبلغ المخطط", min_value=0.0, step=100.0, key="phase_amount")
	if st.button("إضافة مرحلة") and new_phase_name.strip():
		with get_db() as db:
			db.execute("INSERT INTO phases(project_id,name,planned_amount) VALUES (?,?,?)", (project_id, new_phase_name.strip(), float(new_phase_amount)))
		st.success("تمت إضافة المرحلة")
		st.experimental_rerun()

# البنود
with Tabs[2]:
	st.subheader("بنود المواد")
	with get_db() as db:
		phases = db.execute("SELECT id,name FROM phases WHERE project_id=?", (project_id,)).fetchall()
	phase_map = {f"{ph['id']} - {ph['name']}": ph['id'] for ph in phases}
	phase_label = st.selectbox("اختر مرحلة", list(phase_map.keys())) if phase_map else None
	phase_id = phase_map.get(phase_label) if phase_label else None
	if phase_id:
		with get_db() as db:
			materials = db.execute(
				"SELECT m.id, s.name as supplier, m.name, m.quantity, m.unit, m.unit_price, m.total FROM materials m JOIN suppliers s ON s.id=m.supplier_id WHERE m.project_id=? AND m.phase_id=?",
				(project_id, phase_id),
			).fetchall()
		st.table([dict(r) for r in materials])
		c1, c2, c3, c4, c5 = st.columns(5)
		with c1:
			supplier_name = st.text_input("المورد")
		with c2:
			item_name = st.text_input("البند")
		with c3:
			qty = st.number_input("الكمية", min_value=0.0, step=1.0)
		with c4:
			unit = st.text_input("الوحدة")
		with c5:
			unit_price = st.number_input("سعر الوحدة", min_value=0.0, step=1.0)
		if st.button("إضافة بند"):
			if supplier_name.strip() and item_name.strip() and qty > 0:
				with get_db() as db:
					row = db.execute("SELECT id FROM suppliers WHERE name=?", (supplier_name.strip(),)).fetchone()
					sid = row[0] if row else db.execute("INSERT INTO suppliers(name) VALUES (?)", (supplier_name.strip(),)).lastrowid
					total = float(qty) * float(unit_price)
					db.execute(
						"INSERT INTO materials(project_id,phase_id,supplier_id,name,quantity,unit,unit_price,total) VALUES (?,?,?,?,?,?,?,?)",
						(project_id, phase_id, sid, item_name.strip(), float(qty), unit.strip() or None, float(unit_price), total),
					)
				st.success("تمت إضافة البند")
				st.experimental_rerun()

# الخزينة
with Tabs[3]:
	st.subheader("الخزينة")
	with get_db() as db:
		balance = compute_balance(db, project_id)
	st.info(f"الرصيد الحالي: {balance}")
	c1, c2 = st.columns(2)
	with c1:
		st.markdown("**قبض من شريك**")
		partner_name = st.text_input("اسم الشريك", key="rcpt_partner")
		rcpt_amount = st.number_input("المبلغ", min_value=0.0, step=10.0, key="rcpt_amount")
		if st.button("قبض") and partner_name.strip() and rcpt_amount > 0:
			with get_db() as db:
				row = db.execute("SELECT id FROM partners WHERE name=?", (partner_name.strip(),)).fetchone()
				pid = row[0] if row else db.execute("INSERT INTO partners(name) VALUES (?)", (partner_name.strip(),)).lastrowid
				db.execute("INSERT INTO treasury(project_id,direction,amount,partner_id) VALUES (?,?,?,?)", (project_id, 'in', float(rcpt_amount), pid))
			st.success("تم القبض")
			st.experimental_rerun()
	with c2:
		st.markdown("**صرف لمورد**")
		supplier_name = st.text_input("اسم المورد", key="pay_supplier")
		pay_amount = st.number_input("المبلغ", min_value=0.0, step=10.0, key="pay_amount")
		pay_phase_id = st.number_input("رقم المرحلة (اختياري)", min_value=0, step=1, value=0)
		if st.button("صرف") and supplier_name.strip() and pay_amount > 0:
			with get_db() as db:
				balance = compute_balance(db, project_id)
				if balance - pay_amount < 0:
					st.error("رصيد غير كافٍ")
				else:
					row = db.execute("SELECT id FROM suppliers WHERE name=?", (supplier_name.strip(),)).fetchone()
					sid = row[0] if row else db.execute("INSERT INTO suppliers(name) VALUES (?)", (supplier_name.strip(),)).lastrowid
					db.execute("INSERT INTO treasury(project_id,direction,amount,supplier_id,phase_id) VALUES (?,?,?,?,?)", (project_id, 'out', float(pay_amount), sid, int(pay_phase_id) or None))
					st.success("تم الصرف")
					st.experimental_rerun()

# التسوية
with Tabs[4]:
	st.subheader("التسوية حسب المرحلة")
	with get_db() as db:
		phases = db.execute("SELECT id,name FROM phases WHERE project_id=?", (project_id,)).fetchall()
	phase_map = {f"{ph['id']} - {ph['name']}": ph['id'] for ph in phases}
	plabel = st.selectbox("اختر مرحلة للتسوية", list(phase_map.keys())) if phase_map else None
	if plabel:
		phid = phase_map[plabel]
		with get_db() as db:
			cost = db.execute("SELECT COALESCE(SUM(total),0) FROM materials WHERE project_id=? AND phase_id=?", (project_id, phid)).fetchone()[0] or 0
			partners = db.execute("SELECT p.name, pp.percentage, p.id FROM project_partners pp JOIN partners p ON p.id=pp.partner_id WHERE pp.project_id=?", (project_id,)).fetchall()
			paid_map = {r[0]: r[1] for r in db.execute("SELECT partner_id, COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='in' GROUP BY partner_id", (project_id,)).fetchall()}
			rows = []
			for p in partners:
				name, perc, pid = p["name"], float(p["percentage"]), p["id"]
				amount_due = (float(cost) * perc) / 100.0
				amount_paid = float(paid_map.get(pid) or 0)
				delta = amount_due - amount_paid
				status = 'needs_to_pay' if delta > 0 else ('needs_refund' if delta < 0 else 'settled')
				rows.append({"الشريك": name, "المستحق": round(amount_due,2), "المدفوع": round(amount_paid,2), "الفارق": round(delta,2), "الحالة": status})
			st.table(rows)

# التقارير
with Tabs[5]:
	st.subheader("التقارير")
	with get_db() as db:
		incoming = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='in'", (project_id,)).fetchone()[0] or 0
		outgoing = db.execute("SELECT COALESCE(SUM(amount),0) FROM treasury WHERE project_id=? AND direction='out'", (project_id,)).fetchone()[0] or 0
	st.metric("وارد", incoming)
	st.metric("مصروف", outgoing)
	st.metric("الرصيد", float(incoming) - float(outgoing))