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