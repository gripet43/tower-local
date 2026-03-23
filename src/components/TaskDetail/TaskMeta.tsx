'use client'
import { useState } from 'react'
import { Task, Section, Tag } from '@/lib/types'
import { PRIORITY } from '@/lib/utils'

interface Props {
  task: Task
  sections: Section[]
  onUpdate: (d: Record<string, unknown>) => Promise<void>
}

export default function TaskMeta({ task, sections, onUpdate }: Props) {
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [tagsLoaded, setTagsLoaded] = useState(false)

  const loadTags = async () => {
    if (!tagsLoaded) { setAllTags(await (await fetch(`/api/tags?projectId=${task.projectId}`)).json()); setTagsLoaded(true) }
    setShowTagPicker(!showTagPicker)
  }
  const addTag = async (tagId: string) => { if (!tagId) return; await fetch('/api/task-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: task.id, tagId }) }); setShowTagPicker(false); onUpdate({}) }
  const removeTag = async (tagId: string) => { await fetch(`/api/task-tags?taskId=${task.id}&tagId=${tagId}`, { method: 'DELETE' }); onUpdate({}) }
  const availableTags = allTags.filter(at => !task.taskTags?.find(tt => tt.tagId === at.id))

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
        <MetaRow label="截止日期">
          <input type="date" value={task.dueDate ? task.dueDate.slice(0, 10) : ''} onChange={e => onUpdate({ dueDate: e.target.value || null })}
            className="text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1 outline-none hover:border-gray-300 focus:border-blue-400 transition-colors cursor-pointer" />
        </MetaRow>
        <MetaRow label="优先级">
          <div className="flex gap-0.5">{PRIORITY.map(o => (
            <button key={o.value} onClick={() => onUpdate({ priority: o.value })}
              className={`px-2 py-[3px] text-[11px] rounded transition-all ${
                task.priority === o.value ? `${o.cls} font-medium` : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}>{o.label}</button>
          ))}</div>
        </MetaRow>
      </div>
      <MetaRow label="所属分组">
        <select value={task.sectionId || ''} onChange={e => onUpdate({ sectionId: e.target.value || null })}
          className="text-[12px] text-gray-600 border border-gray-200 rounded px-2 py-1 outline-none hover:border-gray-300 focus:border-blue-400 transition-colors">
          <option value="">未分组</option>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </MetaRow>
      <MetaRow label="标签">
        <div className="flex flex-wrap items-center gap-1">
          {(task.taskTags || []).map(tt => (
            <span key={tt.id} className="inline-flex items-center gap-0.5 px-2 py-[2px] rounded-full text-[10px] text-white" style={{ backgroundColor: tt.tag.color }}>
              {tt.tag.name}<button onClick={() => removeTag(tt.tagId)} className="hover:opacity-70 ml-0.5">×</button>
            </span>
          ))}
          {showTagPicker ? (
            <select autoFocus onChange={e => addTag(e.target.value)} onBlur={() => setShowTagPicker(false)} className="text-[11px] border border-gray-300 rounded px-1 py-0.5 bg-white">
              <option value="">选择...</option>{availableTags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : <button onClick={loadTags} className="text-[11px] text-gray-400 hover:text-blue-500">+ 添加</button>}
        </div>
      </MetaRow>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><span className="text-[11px] text-gray-400 w-[48px] flex-shrink-0">{label}</span>{children}</div>
}
