export interface Tag { id: string; name: string; color: string }
export interface TaskTag { id: string; tagId: string; tag: Tag }
export interface Attachment { id: string; fileName: string; storageName: string; mimeType: string; fileSize: number; createdAt: string }
export interface Subtask { id: string; title: string; completed: boolean; sortOrder: number }
export interface Comment { id: string; content: string; createdAt: string }
export interface ActivityLog { id: string; actionType: string; oldValue?: string; newValue?: string; createdAt: string }
export interface TaskCounts { subtasks: number; comments: number; attachments: number; taskTags: number }

export interface Task {
  id: string; taskNumber: number; projectId: string; sectionId: string | null
  sortOrder: number; title: string; completed: boolean; dueDate: string | null
  priority: string; description: string; completedAt: string | null
  createdAt: string; updatedAt: string
  taskTags: TaskTag[]
  _count?: TaskCounts
  // Detail-only fields (from GET /api/tasks/[id])
  attachments?: Attachment[]; subtasks?: Subtask[]; comments?: Comment[]; activityLogs?: ActivityLog[]
}

export interface Section { id: string; name: string; sortOrder: number; projectId: string }
export interface Project { id: string; name: string }
export type FilterStatus = 'all' | 'active' | 'completed'
