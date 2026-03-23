'use client'
import { useState, useRef } from 'react'
import { Task, Section, Tag } from '@/lib/types'
import { fmtDate } from '@/lib/utils'
import SubtaskPanel from './SubtaskPanel'
import CommentList from './CommentList'
import ActivityLogComponent from './ActivityLog'

interface Props {
  task: Task
  sections: Section[]
  allTags: Tag[]
  projectName: string
  onClose: () => void
  onRefresh: () => void
}

export default function TaskDetail({ task, sections, allTags, projectName, onClose, onRefresh }: Props) {
  const patch = async (d: Record<string, unknown>) => {
    await fetch(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
    onRefresh()
  }
  const sectionName = sections.find(s => s.id === task.sectionId)?.name

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-10 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/[0.1]" />
      <div className="relative w-full max-w-[640px] bg-white rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col max-h-[calc(100vh-88px)] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-7 pt-5 pb-2.5 flex-shrink-0">
          <div className="flex items-start gap-2.5">
            <button onClick={() => patch({ completed: !task.completed })}
              className={`w-[15px] h-[15px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 mt-[4px] transition-all ${
                task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
              }`}>
              {task.completed && <svg className="w-[7px] h-[7px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <EditableTitle title={task.title} onSave={t => patch({ title: t })} />
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                <span>{projectName}</span>
                {sectionName && <><svg className="w-2 h-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg><span>{sectionName}</span></>}
                <span className="mx-0.5 text-gray-300">·</span>
                <span className="tabular-nums text-gray-400">#{task.taskNumber}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 p-0.5 rounded transition-colors mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Body — single column flow */}
        <div className="flex-1 overflow-y-auto px-7 pb-6">
          <MetaDisplay task={task} sections={sections} onUpdate={patch} />
          <div className="border-t border-gray-200/70 my-4" />
          <EditableDescription description={task.description || ''} onSave={d => patch({ description: d })} />
          <div className="border-t border-gray-200/70 my-4" />
          <AttachmentSection taskId={task.id} attachments={task.attachments || []} onRefresh={onRefresh} />
          <div className="border-t border-gray-200/70 my-4" />
          <SubtaskPanel taskId={task.id} subtasks={task.subtasks || []} onRefresh={onRefresh} />
          <div className="border-t border-gray-200/70 my-4" />
          <TabSection task={task} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  )
}

// ── Editable Title ──
function EditableTitle({ title, onSave }: { title: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(title)
  if (editing) return (
    <input value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => { setEditing(false); if (val.trim() && val !== title) onSave(val.trim()) }}
      onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); if (val.trim()) onSave(val.trim()) } if (e.key === 'Escape') { setVal(title); setEditing(false) } }}
      autoFocus className="w-full text-[15px] font-semibold text-gray-900 outline-none bg-transparent leading-snug" />
  )
  return <h2 onClick={() => setEditing(true)} className="text-[15px] font-semibold text-gray-900 cursor-text leading-snug">{title}</h2>
}

// ── Meta Display ──
function MetaDisplay({ task, sections, onUpdate }: { task: Task; sections: Section[]; onUpdate: (d: Record<string, unknown>) => Promise<void> }) {
  const [editField, setEditField] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showTagPicker, setShowTagPicker] = useState(false)
  const loadTags = async () => { if (!allTags.length) setAllTags(await (await fetch(`/api/tags?projectId=${task.projectId}`)).json()); setShowTagPicker(true) }

  return (
    <div className="space-y-[3px]">
      <Row label="截止日期">
        {editField === 'dueDate' ? (
          <input type="date" value={task.dueDate ? task.dueDate.slice(0, 10) : ''} onChange={e => { onUpdate({ dueDate: e.target.value || null }); setEditField(null) }} onBlur={() => setEditField(null)} autoFocus className="text-[12px] border border-gray-200 rounded px-1.5 py-[2px] outline-none focus:border-blue-300 text-gray-700" />
        ) : (
          <span onClick={() => setEditField('dueDate')} className={`text-[12px] cursor-pointer hover:text-blue-600 ${task.dueDate ? (isOverdue(task.dueDate, task.completed) ? 'text-red-500' : 'text-gray-700') : 'text-gray-300'}`}>
            {task.dueDate ? fmtDate(task.dueDate) : '设置日期'}
          </span>
        )}
      </Row>
      <Row label="优先级">
        {editField === 'priority' ? (
          <div className="flex gap-0.5">{PRIORITY.map(o => (
            <button key={o.value} onClick={() => { onUpdate({ priority: o.value }); setEditField(null) }} className={`px-2 py-[1px] text-[11px] rounded ${task.priority === o.value ? o.cls + ' font-medium' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>{o.label}</button>
          ))}</div>
        ) : (
          <span onClick={() => setEditField('priority')} className="text-[12px] cursor-pointer hover:text-blue-600">
            {task.priority === 'high' ? <span className="text-red-500 font-medium">高</span> : task.priority === 'medium' ? <span className="text-yellow-600">中</span> : task.priority === 'low' ? <span className="text-blue-500">低</span> : <span className="text-gray-600">普通</span>}
          </span>
        )}
      </Row>
      <Row label="所属分组">
        {editField === 'section' ? (
          <select value={task.sectionId || ''} onChange={e => { onUpdate({ sectionId: e.target.value || null }); setEditField(null) }} onBlur={() => setEditField(null)} autoFocus className="text-[12px] border border-gray-200 rounded px-1.5 py-[2px] outline-none focus:border-blue-300 text-gray-700">
            <option value="">未分组</option>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        ) : (
          <span onClick={() => setEditField('section')} className="text-[12px] text-gray-600 cursor-pointer hover:text-blue-600">{sections.find(s => s.id === task.sectionId)?.name || <span className="text-gray-300">未分组</span>}</span>
        )}
      </Row>
      <Row label="标签">
        <div className="flex flex-wrap items-center gap-1">
          {(task.taskTags || []).map(tt => (
            <span key={tt.id} className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] text-white" style={{ backgroundColor: tt.tag.color }}>
              {tt.tag.name}
              <button onClick={() => { fetch(`/api/task-tags?taskId=${task.id}&tagId=${tt.tagId}`, { method: 'DELETE' }).then(() => onUpdate({})) }} className="hover:opacity-70">×</button>
            </span>
          ))}
          {showTagPicker ? (
            <select autoFocus onChange={e => { if (e.target.value) { fetch('/api/task-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: task.id, tagId: e.target.value }) }).then(() => { setShowTagPicker(false); onUpdate({}) }) } }} onBlur={() => setShowTagPicker(false)}
              className="text-[11px] border border-gray-200 rounded px-1 py-0.5 bg-white">
              <option value="">选择...</option>{allTags.filter(a => !task.taskTags?.find(t => t.tagId === a.id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : <button onClick={loadTags} className="text-gray-300 hover:text-blue-500 text-[11px]">+</button>}
        </div>
      </Row>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center py-[2.5px]"><span className="text-[11px] text-gray-500 font-medium w-[52px] flex-shrink-0">{label}</span><div className="flex-1">{children}</div></div>
}

const PRIORITY = [
  { value: 'normal', label: '普通', cls: 'text-gray-700 bg-gray-50' },
  { value: 'low', label: '低', cls: 'text-blue-600 bg-blue-50' },
  { value: 'medium', label: '中', cls: 'text-yellow-700 bg-yellow-50' },
  { value: 'high', label: '高', cls: 'text-red-600 bg-red-50' },
]

function isOverdue(d: string | null, done: boolean) { return !done && d ? new Date(d) < new Date() : false }

// ── Description ──
function EditableDescription({ description, onSave }: { description: string; onSave: (d: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(description)
  if (!editing && !description) return (
    <div>
      <span className="text-[11px] text-gray-400 block mb-1">描述</span>
      <div onClick={() => setEditing(true)} className="text-[12px] text-gray-300 cursor-pointer hover:text-gray-400 py-0.5">点击添加描述</div>
    </div>
  )
  if (!editing) return (
    <div>
      <span className="text-[11px] text-gray-400 block mb-1">描述</span>
      <div onClick={() => setEditing(true)} className="text-[13px] text-gray-600 leading-[1.65] cursor-text whitespace-pre-wrap">{description}</div>
    </div>
  )
  return (
    <div>
      <span className="text-[11px] text-gray-400 block mb-1">描述</span>
      <textarea value={val} onChange={e => setVal(e.target.value)}
        onBlur={() => { setEditing(false); if (val !== description) onSave(val) }}
        autoFocus rows={4}
        className="w-full text-[13px] text-gray-700 leading-[1.65] border border-gray-200 rounded-lg px-3 py-2.5 resize-none outline-none focus:border-blue-300 bg-white" />
    </div>
  )
}

// ── Attachments ──
function AttachmentSection({ taskId, attachments, onRefresh }: { taskId: string; attachments: { id: string; fileName: string; fileSize: number }[]; onRefresh: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('taskId', taskId); fd.append('file', f); await fetch('/api/attachments', { method: 'POST', body: fd }); onRefresh(); if (ref.current) ref.current.value = '' }
  const del = async (id: string) => { await fetch(`/api/attachments/${id}`, { method: 'DELETE' }); onRefresh() }

  return (
    <div>
      <span className="text-[11px] text-gray-400 block mb-1.5">附件</span>
      {attachments.map(a => (
        <div key={a.id} className="flex items-center gap-2 text-[12px] py-0.5 group">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          <a href={`/api/attachments/${a.id}/download`} className="text-blue-500 hover:underline truncate flex-1">{a.fileName}</a>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{(a.fileSize/1024).toFixed(0)}KB</span>
          <button onClick={() => del(a.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 text-[10px] transition-opacity">删除</button>
        </div>
      ))}
      <button onClick={() => ref.current?.click()} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-500 transition-colors mt-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/></svg>
        上传附件
      </button>
      <input ref={ref} type="file" onChange={upload} className="hidden" />
    </div>
  )
}

// ── Tabs ──
function TabSection({ task, onRefresh }: { task: Task; onRefresh: () => void }) {
  const [tab, setTab] = useState<'activity' | 'comments'>('activity')
  return (
    <div>
      <div className="flex gap-4 mb-3">
        <button onClick={() => setTab('activity')} className={`text-[11px] pb-1.5 border-b-[1.5px] -mb-[1px] transition-colors ${tab === 'activity' ? 'text-gray-700 border-gray-600 font-medium' : 'text-gray-400 border-transparent hover:text-gray-500'}`}>更新记录 ({task.activityLogs?.length ?? 0})</button>
        <button onClick={() => setTab('comments')} className={`text-[11px] pb-1.5 border-b-[1.5px] -mb-[1px] transition-colors ${tab === 'comments' ? 'text-gray-700 border-gray-600 font-medium' : 'text-gray-400 border-transparent hover:text-gray-500'}`}>评论 ({task.comments?.length ?? 0})</button>
      </div>
      {tab === 'activity' && <ActivityLogComponent logs={task.activityLogs || []} />}
      {tab === 'comments' && <CommentList taskId={task.id} comments={task.comments || []} onRefresh={onRefresh} />}
    </div>
  )
}
