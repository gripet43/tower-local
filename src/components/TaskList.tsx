'use client'
import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, Section, Project, FilterStatus } from '@/lib/types'
import { fmtDate } from '@/lib/utils'

interface Props {
  project: Project
  sections: Section[]
  tasks: Task[]
  compact: boolean
  grouped: boolean
  filter: FilterStatus
  selectedTaskId: string | null
  newTaskInput: { sectionId: string | null; title: string } | null
  showNewSection: boolean
  onAddTask: (sectionId: string | null) => void
  onNewTaskChange: (v: string) => void
  onNewTaskSubmit: (sectionId: string | null) => void
  onNewTaskCancel: () => void
  onTaskClick: (task: Task) => void
  onTaskToggle: (task: Task, e: React.MouseEvent) => void
  onRenameSection: (id: string, name: string) => void
  onDeleteSection: (id: string) => void
  onToggleGrouped: () => void
  onToggleFilter: () => void
  onToggleCompact: () => void
  onShowNewSection: () => void
  onCreateSection: (name: string) => void
  onCancelNewSection: () => void
}

export default function TaskList(props: Props) {
  const { project, sections, tasks, compact, grouped, filter, selectedTaskId, newTaskInput, showNewSection } = props
  const secGroups = grouped ? sections.map(s => ({ section: s, tasks: tasks.filter(t => t.sectionId === s.id).sort((a, b) => a.sortOrder - b.sortOrder) })) : []
  const ungrouped = tasks.filter(t => !t.sectionId).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <h1 className="text-[15px] font-semibold text-gray-800">{project.name}</h1>
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => props.onAddTask(sections[0]?.id || null)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-[13px] rounded hover:bg-blue-600 transition-colors">
            <span className="text-[14px] leading-none font-light">+</span>添加任务
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-1.5 border-b border-gray-50">
        <button onClick={props.onToggleGrouped} className={`flex items-center gap-1.5 text-[12px] ${grouped ? 'text-gray-600' : 'text-gray-400'}`}>
          <span className={`w-[28px] h-[16px] rounded-full relative ${grouped ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow-sm transition-transform ${grouped ? 'left-[14px]' : 'left-[2px]'}`}/>
          </span>按清单分组
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={props.onToggleFilter} className={`p-1 rounded ${filter !== 'active' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          </button>
          <button onClick={props.onToggleCompact} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {grouped && secGroups.map(({ section, tasks: st }) => (
          <SectionBlock key={section.id} section={section} tasks={st} compact={compact} selectedTaskId={selectedTaskId}
            newTask={newTaskInput} onAddTask={props.onAddTask}
            onNewTaskChange={props.onNewTaskChange} onNewTaskSubmit={props.onNewTaskSubmit} onNewTaskCancel={props.onNewTaskCancel}
            onTaskClick={props.onTaskClick} onTaskToggle={props.onTaskToggle}
            onRename={props.onRenameSection} onDelete={props.onDeleteSection} />
        ))}
        {ungrouped.length > 0 && (
          <div>
            {grouped && <div className="px-6 py-1 text-[11px] text-gray-400 border-b border-gray-50">未分组 · {ungrouped.length}</div>}
            {ungrouped.map(t => <TaskRow key={t.id} task={t} compact={compact} selected={t.id === selectedTaskId} onClick={() => props.onTaskClick(t)} onToggle={e => props.onTaskToggle(t, e)} />)}
            {newTaskInput?.sectionId === null && grouped && <InlineInput value={newTaskInput.title} onChange={props.onNewTaskChange} onSubmit={() => props.onNewTaskSubmit(null)} onCancel={props.onNewTaskCancel} />}
          </div>
        )}
        {!grouped && tasks.sort((a, b) => a.sortOrder - b.sortOrder).map(t => <TaskRow key={t.id} task={t} compact={compact} selected={t.id === selectedTaskId} onClick={() => props.onTaskClick(t)} onToggle={e => props.onTaskToggle(t, e)} />)}
        {showNewSection && <NewSectionInput onSubmit={props.onCreateSection} onCancel={props.onCancelNewSection} />}
        {tasks.length === 0 && !showNewSection && (
          <div className="flex flex-col items-center justify-center py-28 text-gray-300">
            <p className="text-[13px]">暂无任务</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section ──
function SectionBlock({ section, tasks, compact, selectedTaskId, newTask, onAddTask, onNewTaskChange, onNewTaskSubmit, onNewTaskCancel, onTaskClick, onTaskToggle, onRename, onDelete }: {
  section: Section; tasks: Task[]; compact: boolean; selectedTaskId: string | null
  newTask: { sectionId: string | null; title: string } | null
  onAddTask: (sid: string | null) => void; onNewTaskChange: (v: string) => void; onNewTaskSubmit: (sid: string | null) => void; onNewTaskCancel: () => void
  onTaskClick: (t: Task) => void; onTaskToggle: (t: Task, e: React.MouseEvent) => void
  onRename: (id: string, n: string) => void; onDelete: (id: string) => void
}) {
  const { setNodeRef } = useDroppable({ id: `drop-${section.id}` })
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(section.name)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  return (
    <div ref={setNodeRef}>
      {/* Section header */}
      <div className="flex items-center gap-1.5 px-6 py-[7px] border-b border-gray-50 select-none">
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-500 w-3.5 h-3.5 flex items-center justify-center transition-transform" style={{ transform: collapsed ? 'rotate(-90deg)' : '' }}>
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
        </button>
        {editing ? (
          <input ref={inputRef} value={editName} onChange={e => setEditName(e.target.value)}
            onBlur={() => { setEditing(false); if (editName.trim() && editName !== section.name) onRename(section.id, editName.trim()) }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); if (editName.trim()) onRename(section.id, editName.trim()) } if (e.key === 'Escape') { setEditName(section.name); setEditing(false) } }}
            className="text-[13px] font-medium bg-white border border-gray-300 rounded px-1 py-0.5 flex-1 outline-none" />
        ) : <span className="text-[13px] font-medium text-gray-700 flex-1 cursor-pointer hover:text-blue-600" onDoubleClick={() => setEditing(true)}>{section.name}</span>}
        <span className="text-[11px] text-gray-400 tabular-nums">{tasks.length}</span>
        <button onClick={() => onDelete(section.id)} className="text-gray-300 hover:text-red-400 ml-0.5 opacity-0 hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      {!collapsed && (
        <>
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(t => <TaskRow key={t.id} task={t} compact={compact} selected={t.id === selectedTaskId} onClick={() => onTaskClick(t)} onToggle={e => onTaskToggle(t, e)} />)}
          </SortableContext>
          {newTask?.sectionId === section.id
            ? <InlineInput value={newTask.title} onChange={onNewTaskChange} onSubmit={() => onNewTaskSubmit(section.id)} onCancel={onNewTaskCancel} />
            : <button onClick={() => onAddTask(section.id)} className="w-full text-left px-6 py-1 text-[12px] text-gray-300 hover:text-blue-500 transition-colors">+ 添加任务</button>}
        </>
      )}
    </div>
  )
}

// ── Task Row ──
function TaskRow({ task, compact, selected, onClick, onToggle }: {
  task: Task; compact: boolean; selected: boolean; onClick: () => void; onToggle: (e: React.MouseEvent) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const subCount = task._count?.subtasks ?? 0
  const comCount = task._count?.comments ?? 0

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`flex items-center gap-2.5 px-6 cursor-default select-none transition-colors border-b border-gray-50 ${
        compact ? 'py-[3px]' : 'py-[6px]'
      } ${isDragging ? 'opacity-30 shadow-sm' : selected ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'} ${task.completed ? 'opacity-40' : ''}`}>
      {/* Checkbox */}
      <button onClick={onToggle} className={`w-[15px] h-[15px] rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
        task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
      }`}>
        {task.completed && <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
      </button>
      {/* Title */}
      <span onClick={onClick} className={`flex-1 text-[13px] truncate cursor-pointer ${task.completed ? 'line-through text-gray-400' : selected ? 'text-gray-800' : 'text-gray-700 hover:text-blue-600'}`}>{task.title}</span>
      {/* Meta */}
      <div className="flex items-center gap-2 flex-shrink-0 text-[11px] text-gray-400 tabular-nums">
        {subCount > 0 && <span>{subCount}子</span>}
        {comCount > 0 && <span>{comCount}评</span>}
        {task.dueDate && <span className={isOverdue(task.dueDate, task.completed) ? 'text-red-500' : ''}>{fmtDate(task.dueDate)}</span>}
      </div>
    </div>
  )
}

function isOverdue(d: string | null, done: boolean) { return !done && d ? new Date(d) < new Date() : false }

// ── Inline Input ──
function InlineInput({ value, onChange, onSubmit, onCancel }: { value: string; onChange: (v: string) => void; onSubmit: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="flex items-center gap-2 px-6 py-[5px] border-b border-gray-50">
      <span className="w-[15px] h-[15px] rounded-full border border-dashed border-gray-300 flex-shrink-0" />
      <input ref={ref} value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSubmit(); if (e.key === 'Escape') onCancel() }}
        placeholder="输入任务标题，回车创建" className="flex-1 text-[13px] outline-none" />
    </div>
  )
}

// ── New Section ──
function NewSectionInput({ onSubmit, onCancel }: { onSubmit: (n: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="flex items-center gap-2 px-6 py-1.5 border-b border-gray-50">
      <input ref={ref} value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()); if (e.key === 'Escape') onCancel() }}
        placeholder="输入分组名称..." className="flex-1 text-[13px] outline-none border border-gray-200 rounded px-2 py-1" />
      <button onClick={() => name.trim() && onSubmit(name.trim())} className="text-[12px] text-blue-500">创建</button>
    </div>
  )
}
