import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { api, type Project } from './lib/api'
import './App.css'
import ProjectPage from './pages/ProjectPage'

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get<Project[]>('/projects').then(r => setProjects(r.data))
  }, [])

  const create = async () => {
    setErrMsg('')
    if (!name.trim()) return
    try {
      setSubmitting(true)
      const r = await api.post<Project>('/projects', { name })
      setProjects([r.data, ...projects])
      setName('')
      navigate(`/projects/${r.data.id}`)
    } catch (e: any) {
      setErrMsg(e?.response?.data?.message || 'تعذر إنشاء المشروع')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h2>المشاريع</h2>
      {errMsg && <div style={{color:'red'}}>{errMsg}</div>}
      <div className="row">
        <input placeholder="اسم المشروع" value={name} onChange={e => setName(e.target.value)} />
        <button disabled={submitting} onClick={create}>{submitting? '...جاري':'إنشاء'}</button>
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
        <Route path="/projects/:id" element={<ProjectPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
