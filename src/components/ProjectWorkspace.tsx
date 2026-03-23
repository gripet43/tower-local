'use client'
import { useState, useEffect, useCallback } from 'react'
import { Project, Section, Task, FilterStatus } from '@/lib/types'
import TopNav from './TopNav'
import ProjectCard from './ProjectCard'
import TaskDetail from './TaskDetail'

interface Props {
  projectId: string
  project: Project & { sections: Section[] }
}

export default function ProjectWorkspace({ projectId, project: initialProject }: Props) {
  const [project, setProject] = useState(initialProject)
  const [sections, setSections] = useState<Section[]>(initialProject.sections)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [grouped, setGrouped] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('active')
  const [newTaskSection, setNewTaskSection] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [allProjects, setAllProjects] = useState<Project[]>([])

  const refresh = useCallback(async () => {
    const [t, s, p] = await Promise.all([
      fetch(`/api/tasks?projectId=${projectId}`).then(r => r.json()),
      fetch(`/api/sections?projectId=${projectId}`).then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ])
    setTasks(t); setSections(s); setAllProjects(p)
  }, [projectId])

  useEffect(() => { refresh() }, [refresh])

  const loadDetail = useCallback(async (id: string) => {
    const t = await fetch(`/api/tasks/${id}`).then(r => r.json())
    setSelectedTask(t)
  }, [])

  const handleTaskClick = (task: Task) => { setSelectedTaskId(task.id); loadDetail(task.id) }
  const handleClose = () => { setSelectedTaskId(null); setSelectedTask(null) }
  const handleRefresh = () => { refresh(); if (selectedTaskId) loadDetail(selectedTaskId) }

  const addTask = async (sectionId: string | null) => {
    if (!newTaskTitle.trim()) return
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, sectionId, title: newTaskTitle.trim() }) })
    setNewTaskTitle(''); setNewTaskSection(null); refresh()
  }

  const toggleTask = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !task.completed }) })
    handleRefresh()
  }

  const changeDate = async (taskId: string, date: string | null) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dueDate: date }) })
    refresh()
  }

  const createSection = async (name: string) => {
    await fetch('/api/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, name }) })
    refresh()
  }

  const renameSection = async (id: string, name: string) => {
    await fetch(`/api/sections/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    refresh()
  }

  const deleteSection = async (id: string) => {
    await fetch(`/api/sections/${id}`, { method: 'DELETE' })
    refresh()
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="min-h-screen" style={{ background: '#f4f7f0' }}>
      <TopNav projects={allProjects} currentId={projectId} />
      <main className="max-w-[700px] mx-auto mt-5 px-4 pb-16">
        <ProjectCard
          project={project}
          sections={sections}
          tasks={filteredTasks}
          grouped={grouped}
          filter={filter}
          selectedTaskId={selectedTaskId}
          newTaskSection={newTaskSection}
          newTaskTitle={newTaskTitle}
          onToggleGrouped={() => setGrouped(!grouped)}
          onToggleFilter={() => setFilter(f => f === 'active' ? 'completed' : f === 'completed' ? 'all' : 'active')}
          onTaskClick={handleTaskClick}
          onTaskToggle={toggleTask}
          onDateChange={changeDate}
          onStartAddTask={(sid) => { setNewTaskSection(sid); setNewTaskTitle('') }}
          onNewTaskTitleChange={setNewTaskTitle}
          onNewTaskSubmit={addTask}
          onNewTaskCancel={() => { setNewTaskSection(null); setNewTaskTitle('') }}
          onCreateSection={createSection}
          onRenameSection={renameSection}
          onDeleteSection={deleteSection}
        />
      </main>
      {selectedTask && selectedTaskId && (
        <TaskDetail task={selectedTask} sections={sections} allTags={[]} projectName={project.name} onClose={handleClose} onRefresh={handleRefresh} />
      )}
    </div>
  )
}
