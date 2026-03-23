'use client'
import { useState } from 'react'
import { Project } from '@/lib/types'

interface Props {
  projects: Project[]
  activeId: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
}

export default function Sidebar({ projects, activeId, onSelect, onCreate }: Props) {
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')

  return (
    <aside className="w-[220px] bg-[#3a3f4b] flex flex-col flex-shrink-0">
      {/* Icon bar */}
      <div className="flex items-center gap-5 px-5 py-3 border-b border-white/10">
        <IconBtn title="设置" />
        <IconBtn title="归档" />
        <IconBtn title="回收站" />
      </div>
      {/* Project list */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-5 pb-1.5 text-[11px] text-white/40 font-medium">任务列表</div>
        {projects.map(p => (
          <div key={p.id} onClick={() => onSelect(p.id)}
            className={`mx-2 px-3 py-[6px] rounded cursor-pointer text-[13px] truncate transition-colors ${
              p.id === activeId ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white/70'
            }`}>
            {p.name}
          </div>
        ))}
        {showNew ? (
          <div className="px-3 py-1 mx-2">
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onCreate(name.trim()); setName(''); setShowNew(false) } if (e.key === 'Escape') { setShowNew(false); setName('') } }}
              onBlur={() => { if (name.trim()) { onCreate(name.trim()); setName('') } else setShowNew(false) }}
              placeholder="清单名称" className="w-full text-[13px] bg-white/10 text-white placeholder:text-white/30 border border-white/20 rounded px-2.5 py-1.5 outline-none focus:border-white/40" />
          </div>
        ) : (
          <button onClick={() => setShowNew(true)} className="w-full text-left px-5 py-[6px] text-[12px] text-white/30 hover:text-white/50 transition-colors">+ 新建任务清单</button>
        )}
      </nav>
    </aside>
  )
}

function IconBtn({ title }: { title: string }) {
  return (
    <button className="w-6 h-6 rounded bg-white/10 text-white/50 hover:text-white/70 transition-colors flex items-center justify-center" title={title}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /></svg>
    </button>
  )
}
