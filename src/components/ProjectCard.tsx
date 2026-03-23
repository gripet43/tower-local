'use client'
import { useState, useRef, useEffect } from 'react'
import { Project, Section, Task, FilterStatus } from '@/lib/types'
import { fmtDate } from '@/lib/utils'
import DatePicker from './DatePicker'

interface Props {
  project: Project
  sections: Section[]
  tasks: Task[]
  grouped: boolean
  filter: FilterStatus
  selectedTaskId: string | null
  newTaskSection: string | null
  newTaskTitle: string
  onToggleGrouped: () => void
  onToggleFilter: () => void
  onTaskClick: (task: Task) => void
  onTaskToggle: (task: Task) => void
  onDateChange: (taskId: string, date: string | null) => void
  onStartAddTask: (sectionId: string | null) => void
  onNewTaskTitleChange: (v: string) => void
  onNewTaskSubmit: (sectionId: string | null) => void
  onNewTaskCancel: () => void
  onCreateSection: (name: string) => void
  onRenameSection: (id: string, name: string) => void
  onDeleteSection: (id: string) => void
}

export default function ProjectCard(props: Props) {
  const { project, sections, tasks, grouped, filter, selectedTaskId, newTaskSection, newTaskTitle } = props
  const [showNewSection, setShowNewSection] = useState(false)

  const secGroups = grouped
    ? sections.map(s => ({ section: s, tasks: tasks.filter(t => t.sectionId === s.id).sort((a, b) => a.sortOrder - b.sortOrder) }))
    : []
  const ungrouped = tasks.filter(t => !t.sectionId).sort((a, b) => a.sortOrder - b.sortOrder)
  const allSorted = tasks.sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]">
      {/* Project name */}
      <div className="px-6 pt-5 pb-1">
        <h1 className="text-[21px] font-bold text-gray-900 leading-tight tracking-[-0.01em]">{project.name}</h1>
      </div>

      {/* Light links */}
      <div className="flex items-center gap-4 px-6 pt-1 pb-3 text-[12px] text-gray-400">
        <button className="hover:text-gray-600 transition-colors">回收站</button>
        <button className="hover:text-gray-600 transition-colors">设置</button>
      </div>

      {/* "任务" label */}
      <div className="px-6 pb-1.5">
        <h2 className="text-[13px] text-gray-500 font-medium">任务</h2>
      </div>

      {/* Add task */}
      <div className="px-6 pb-2.5">
        <button onClick={() => props.onStartAddTask(sections[0]?.id || null)}
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-600 border border-gray-200 rounded px-3 py-[6px] hover:bg-gray-50 hover:border-gray-300 transition-colors">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          添加任务
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 pb-2 text-[12px]">
        <button onClick={props.onToggleFilter} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          {filter === 'active' ? '今天到期…' : filter === 'completed' ? '已完成' : '全部'}
        </button>
        <div className="flex items-center gap-3">
          <button onClick={props.onToggleGrouped} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            分组
          </button>
          <button className="text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            添加视图
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Task list */}
      <div className="pb-1">
        {grouped ? (
          <>
            {secGroups.map(({ section, tasks: st }) => (
              <SectionBlock key={section.id} section={section} tasks={st} selectedTaskId={selectedTaskId}
                newTask={newTaskSection === section.id ? newTaskTitle : null}
                onTaskClick={props.onTaskClick} onTaskToggle={props.onTaskToggle} onDateChange={props.onDateChange}
                onStartAddTask={() => props.onStartAddTask(section.id)}
                onNewTaskTitleChange={props.onNewTaskTitleChange}
                onNewTaskSubmit={() => props.onNewTaskSubmit(section.id)}
                onNewTaskCancel={props.onNewTaskCancel}
                onRename={(n) => props.onRenameSection(section.id, n)}
                onDelete={() => props.onDeleteSection(section.id)} />
            ))}
            {ungrouped.length > 0 && (
              <div>
                <div className="px-6 py-[3px] text-[10px] text-gray-400 uppercase tracking-wide">未分组</div>
                {ungrouped.map(t => <TaskRow key={t.id} task={t} selected={t.id === selectedTaskId} onClick={() => props.onTaskClick(t)} onToggle={() => props.onTaskToggle(t)} onDateChange={props.onDateChange} />)}
              </div>
            )}
          </>
        ) : (
          allSorted.map(t => <TaskRow key={t.id} task={t} selected={t.id === selectedTaskId} onClick={() => props.onTaskClick(t)} onToggle={() => props.onTaskToggle(t)} onDateChange={props.onDateChange} />)
        )}

        {showNewSection ? (
          <NewSectionInput onSubmit={(n) => { props.onCreateSection(n); setShowNewSection(false) }} onCancel={() => setShowNewSection(false)} />
        ) : (
          <div className="px-6 py-1.5">
            <button onClick={() => setShowNewSection(true)} className="text-[11px] text-gray-400 hover:text-gray-500 transition-colors">+ 添加新分组…</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section ──
function SectionBlock({ section, tasks, selectedTaskId, newTask, onTaskClick, onTaskToggle, onDateChange, onStartAddTask, onNewTaskTitleChange, onNewTaskSubmit, onNewTaskCancel, onRename, onDelete }: {
  section: Section; tasks: Task[]; selectedTaskId: string | null; newTask: string | null
  onTaskClick: (t: Task) => void; onTaskToggle: (t: Task) => void; onDateChange?: (taskId: string, date: string | null) => void
  onStartAddTask: () => void; onNewTaskTitleChange: (v: string) => void; onNewTaskSubmit: () => void; onNewTaskCancel: () => void
  onRename: (n: string) => void; onDelete: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(section.name)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-[5px] px-6 py-[4px] select-none">
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-300 hover:text-gray-400 w-[14px] flex items-center justify-center">
          <svg className={`w-2 h-2 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
        </button>
        {editing ? (
          <input ref={inputRef} value={editName} onChange={e => setEditName(e.target.value)}
            onBlur={() => { setEditing(false); if (editName.trim() && editName !== section.name) onRename(editName.trim()) }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); if (editName.trim()) onRename(editName.trim()) } if (e.key === 'Escape') { setEditName(section.name); setEditing(false) } }}
            className="text-[12px] font-medium bg-white border border-gray-300 rounded px-1 py-0.5 flex-1 outline-none" />
        ) : (
          <span onDoubleClick={() => setEditing(true)} className="text-[12px] font-medium text-gray-600 cursor-pointer hover:text-gray-800">{section.name}</span>
        )}
        <span className="text-[10px] text-gray-400 tabular-nums">{tasks.length}</span>
      </div>
      {!collapsed && (
        <>
          {tasks.map(t => <TaskRow key={t.id} task={t} selected={t.id === selectedTaskId} onClick={() => onTaskClick(t)} onToggle={() => onTaskToggle(t)} onDateChange={onDateChange} />)}
          {newTask !== null ? (
            <div className="flex items-center gap-2 px-6 py-[3px]">
              <span className="w-[13px] h-[13px] rounded-full border border-dashed border-gray-300 flex-shrink-0" />
              <input autoFocus value={newTask} onChange={e => onNewTaskTitleChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onNewTaskSubmit(); if (e.key === 'Escape') onNewTaskCancel() }}
                onBlur={onNewTaskCancel}
                placeholder="输入任务标题，回车创建" className="flex-1 text-[13px] outline-none text-gray-700" />
            </div>
          ) : (
            <button onClick={onStartAddTask} className="w-full text-left px-6 py-[2px] text-[11px] text-gray-400 hover:text-blue-500 transition-colors">添加任务</button>
          )}
        </>
      )}
    </div>
  )
}

// ── Task Row ──
function TaskRow({ task, selected, onClick, onToggle, onDateChange }: { task: Task; selected: boolean; onClick?: () => void; onToggle?: () => void; onDateChange?: (taskId: string, date: string | null) => void }) {
  const subCount = task._count?.subtasks ?? 0
  const comCount = task._count?.comments ?? 0
  const [animating, setAnimating] = useState(false)

  const handleToggle = () => {
    setAnimating(true)
    onToggle?.()
    setTimeout(() => setAnimating(false), 400)
  }

  return (
    <div className={`flex items-center gap-2 px-6 py-[3px] cursor-default select-none transition-colors ${
      selected ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'
    } ${task.completed ? 'opacity-35' : ''}`}>
      {/* Checkbox with animation */}
      <button onClick={handleToggle}
        className={`w-[13px] h-[13px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          task.completed ? 'bg-green-500 border-green-500 text-white scale-110' : 'border-gray-300 hover:border-green-400'
        }`}>
        <svg className={`w-[7px] h-[7px] transition-all duration-300 ${task.completed || animating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
            style={{ strokeDasharray: 24, strokeDashoffset: task.completed || animating ? 0 : 24, transition: 'stroke-dashoffset 0.3s ease' }} />
        </svg>
      </button>
      {/* Title */}
      <span onClick={onClick} className={`flex-1 text-[13px] truncate cursor-pointer ${
        task.completed ? 'line-through text-gray-400' : selected ? 'text-gray-900' : 'text-gray-800 hover:text-blue-600'
      }`}>{task.title}</span>
      {/* Meta */}
      <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-gray-400 tabular-nums">
        {subCount > 0 && <span>{subCount}子</span>}
        {comCount > 0 && <span>{comCount}评</span>}
        <DatePicker value={task.dueDate ? task.dueDate.slice(0, 10) : null}
          onChange={(date) => onDateChange?.(task.id, date)}
          isOverdue={!!(task.dueDate && isOverdue(task.dueDate, task.completed))} />
      </div>
    </div>
  )
}

function isOverdue(d: string | null, done: boolean) { return !done && d ? new Date(d) < new Date() : false }

function NewSectionInput({ onSubmit, onCancel }: { onSubmit: (n: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="flex items-center gap-2 px-6 py-1">
      <input ref={ref} value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()); if (e.key === 'Escape') onCancel() }}
        placeholder="输入分组名称..." className="flex-1 text-[12px] outline-none border border-gray-200 rounded px-2 py-0.5" />
      <button onClick={() => name.trim() && onSubmit(name.trim())} className="text-[11px] text-blue-500">创建</button>
    </div>
  )
}
