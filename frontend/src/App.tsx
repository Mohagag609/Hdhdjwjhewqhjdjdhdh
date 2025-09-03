import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { api, type Project } from './lib/api'
import './App.css'

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get<Project[]>('/projects').then(r => setProjects(r.data))
  }, [])

  const create = async () => {
    if (!name.trim()) return
    const r = await api.post<Project>('/projects', { name })
    setProjects([r.data, ...projects])
    setName('')
    navigate(`/projects/${r.data.id}`)
  }

  return (
    <div className="container">
      <h2>المشاريع</h2>
      <div className="row">
        <input placeholder="اسم المشروع" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={create}>إنشاء</button>
      </div>
      <ul>
        {projects.map(p => (
          <li key={p.id}><Link to={`/projects/${p.id}`}>{p.name}</Link></li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_APP_BASE || '/app'}>
      <nav className="nav">
        <Link to="/">المشاريع</Link>
        <a href="/docs" target="_blank" rel="noreferrer">Swagger</a>
      </nav>
      <Routes>
        <Route path="/" element={<ProjectsPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
