'use client'
import { useState } from 'react'
import { Project } from '@/lib/types'
import Link from 'next/link'

interface Props {
  projects: Project[]
  currentId: string
}

export default function TopNav({ projects, currentId }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')

  const create = async () => {
    if (!name.trim()) return
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) })
    const p = await res.json()
    setShowCreate(false); setName('')
    window.location.href = `/projects/${p.id}`
  }

  return (
    <nav style={{ background: '#e8eddf', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="max-w-[760px] mx-auto px-5 flex items-center justify-between h-[38px]">
        <div className="flex items-center gap-2">
          <Link href={`/projects/${currentId}`} className="text-[13px] font-semibold text-gray-600 hover:text-gray-800">Tower</Link>
          <ProjectSwitcher projects={projects} currentId={currentId} />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          {showCreate ? (
            <div className="flex items-center gap-1">
              <input autoFocus value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') { setShowCreate(false); setName('') } }}
                placeholder="清单名称" className="text-[11px] border border-gray-300 rounded px-1.5 py-[2px] w-20 outline-none bg-white/70" />
              <button onClick={create} className="text-[11px] text-blue-500">创建</button>
            </div>
          ) : (
            <button onClick={() => setShowCreate(true)} className="hover:text-gray-700 transition-colors">新建清单</button>
          )}
          <Link href={`/projects/${currentId}`} className="hover:text-gray-700 transition-colors">所有清单</Link>
        </div>
      </div>
    </nav>
  )
}

function ProjectSwitcher({ projects, currentId }: { projects: Project[]; currentId: string }) {
  const [open, setOpen] = useState(false)
  const current = projects.find(p => p.id === currentId)

  return (
    <div className="relative flex items-center">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700">
        {current?.name || '选择项目'}
        <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-0.5 z-50">
            {projects.map(p => (
              <Link key={p.id} href={`/projects/${p.id}`} onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 text-[12px] hover:bg-gray-50 ${p.id === currentId ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {p.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
