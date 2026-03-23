'use client'
import { useState } from 'react'
import { Subtask } from '@/lib/types'

interface Props {
  taskId: string
  subtasks: Subtask[]
  onRefresh: () => void
}

export default function SubtaskPanel({ taskId, subtasks, onRefresh }: Props) {
  const [newTitle, setNewTitle] = useState('')
  const done = subtasks.filter(s => s.completed).length
  const total = subtasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const add = async () => { if (!newTitle.trim()) return; await fetch('/api/subtasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, title: newTitle.trim() }) }); setNewTitle(''); onRefresh() }
  const toggle = async (sub: Subtask) => { await fetch(`/api/subtasks/${sub.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !sub.completed }) }); onRefresh() }
  const del = async (id: string) => { await fetch(`/api/subtasks/${id}`, { method: 'DELETE' }); onRefresh() }

  return (
    <div>
      <span className="text-[11px] text-gray-400 block mb-1.5">子任务</span>
      {total > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-[2px] bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 tabular-nums">{done}/{total}</span>
        </div>
      )}
      <div className="space-y-[2px] mb-2">
        {subtasks.map(sub => (
          <div key={sub.id} className="flex items-center gap-2 group py-[2px]">
            <button onClick={() => toggle(sub)}
              className={`w-[13px] h-[13px] rounded-[3px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                sub.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
              }`}>
              {sub.completed && <svg className="w-[7px] h-[7px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
            </button>
            <span className={`text-[12px] flex-1 leading-snug ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{sub.title}</span>
            <button onClick={() => del(sub.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
      {total === 0 && <p className="text-[11px] text-gray-300 mb-2">暂无子任务</p>}
      <div className="flex gap-1.5">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }}
          placeholder="添加子任务" className="flex-1 text-[11px] border border-gray-100 rounded px-2 py-[3px] outline-none bg-gray-50 focus:bg-white focus:border-gray-200 placeholder:text-gray-300" />
        {newTitle && <button onClick={add} className="text-[11px] text-blue-500 px-1">添加</button>}
      </div>
    </div>
  )
}
