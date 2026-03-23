'use client'
import { ActivityLog } from '@/lib/types'
import { ACTIONS, fmtDateTime } from '@/lib/utils'

interface Props {
  logs: ActivityLog[]
}

export default function ActivityLogComponent({ logs }: Props) {
  if (logs.length === 0) return <p className="text-[11px] text-gray-300">暂无操作记录</p>
  return (
    <div className="space-y-3 relative pl-[14px]">
      {logs.map((l, i) => (
        <div key={l.id} className="relative">
          {/* Timeline line */}
          {i < logs.length - 1 && <div className="absolute left-[-10px] top-[14px] w-px h-[calc(100%+4px)] bg-gray-200" />}
          <div className="flex items-start gap-2">
            {/* Dot */}
            <div className="absolute left-[-12px] top-[5px] w-[5px] h-[5px] rounded-full bg-gray-300" />
            {/* Time */}
            <span className="text-[10px] text-gray-400 w-[80px] flex-shrink-0 tabular-nums">{formatTime(l.createdAt)}</span>
            {/* Content */}
            <span className="text-[12px] text-gray-600 flex-1">
              {ACTIONS[l.actionType] || l.actionType}
              {l.oldValue && l.oldValue !== '' && <span className="text-gray-400"> 「{truncate(l.oldValue)}」</span>}
              {l.newValue && l.newValue !== '' && !['completed', 'uncompleted'].includes(l.actionType) && <span className="text-gray-700"> → 「{truncate(l.newValue)}」</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatTime(d: string) {
  const dt = new Date(d)
  const now = new Date()
  const isToday = dt.toDateString() === now.toDateString()
  const time = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
  return isToday ? `今天 ${time}` : `${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${time}`
}

function truncate(s: string, max = 20) {
  return s.length > max ? s.slice(0, max) + '…' : s
}
