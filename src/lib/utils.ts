export async function api(path: string, opts?: RequestInit) {
  const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...opts?.headers } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export const PRIORITY = [
  { value: 'normal', label: '普通', cls: 'bg-gray-100 text-gray-600' },
  { value: 'low', label: '低', cls: 'bg-blue-50 text-blue-600' },
  { value: 'medium', label: '中', cls: 'bg-yellow-50 text-yellow-600' },
  { value: 'high', label: '高', cls: 'bg-red-50 text-red-600' },
] as const

export const ACTIONS: Record<string, string> = {
  created: '创建了任务', title_changed: '修改了标题', description_changed: '修改了描述',
  dueDate_changed: '修改了截止时间', priority_changed: '修改了优先级', section_changed: '移动了分组',
  tag_added: '添加了标签', tag_removed: '删除了标签', subtask_added: '添加了子任务',
  subtask_completed: '完成了子任务', subtask_uncompleted: '恢复了子任务', subtask_deleted: '删除了子任务',
  comment_added: '添加了评论', comment_deleted: '删除了评论', attachment_added: '上传了附件',
  attachment_deleted: '删除了附件', completed: '完成了任务', uncompleted: '恢复了任务',
}

export function fmtDate(d: string | null) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getMonth() + 1}月${dt.getDate()}日`
}

export function fmtDateTime(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
}

export function fmtFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}
