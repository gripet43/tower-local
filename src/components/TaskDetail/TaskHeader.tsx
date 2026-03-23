'use client'
import { useState } from 'react'
import { Task } from '@/lib/types'

interface Props {
  task: Task
  projectName: string
  sectionName?: string
  onUpdate: (d: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export default function TaskHeader({ task, projectName, sectionName, onUpdate, onClose }: Props) {
  const [title, setTitle] = useState(task.title)
  const [editing, setEditing] = useState(false)

  return (
    <div className="px-6 pt-4 pb-3 border-b border-gray-100/60 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {/* Checkbox */}
        <button onClick={() => onUpdate({ completed: !task.completed })}
          className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
            task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
          }`}>
          {task.completed && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
        </button>
        {/* Title */}
        {editing ? (
          <input value={title} onChange={e => setTitle(e.target.value)}
            onBlur={() => { setEditing(false); if (title.trim() && title !== task.title) onUpdate({ title: title.trim() }) }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); if (title.trim()) onUpdate({ title: title.trim() }) } if (e.key === 'Escape') { setTitle(task.title); setEditing(false) } }}
            autoFocus className="flex-1 text-[16px] font-semibold text-gray-900 outline-none bg-transparent border-b border-gray-300 pb-0.5" />
        ) : (
          <h2 onClick={() => setEditing(true)} className="flex-1 text-[16px] font-semibold text-gray-900 cursor-text leading-snug">
            {title || '无标题'}
          </h2>
        )}
        {/* Number badge */}
        <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0">#{task.taskNumber}</span>
        {/* Close */}
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 flex-shrink-0 ml-0.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      {/* Path */}
      {(projectName || sectionName) && (
        <div className="flex items-center gap-1 mt-1.5 ml-7 text-[11px] text-gray-400">
          <span>{projectName}</span>
          {sectionName && <><svg className="w-2.5 h-2.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg><span>{sectionName}</span></>}
        </div>
      )}
    </div>
  )
}
