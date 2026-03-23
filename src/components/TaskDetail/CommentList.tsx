'use client'
import { useState } from 'react'
import { Comment } from '@/lib/types'
import { fmtDateTime } from '@/lib/utils'

interface Props {
  taskId: string
  comments: Comment[]
  onRefresh: () => void
}

export default function CommentList({ taskId, comments, onRefresh }: Props) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, content: content.trim() }) })
    setContent(''); setSubmitting(false); onRefresh()
  }

  const del = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="group">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">我</div>
            <span className="text-[10px] text-gray-400 tabular-nums">{fmtDateTime(c.createdAt)}</span>
            <button onClick={() => del(c.id)} className="text-gray-300 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ml-auto">删除</button>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed pl-7 whitespace-pre-wrap">{c.content}</p>
        </div>
      ))}
      {comments.length === 0 && <p className="text-[11px] text-gray-300">暂无评论</p>}
      {/* Input */}
      <div className="flex gap-2 mt-2">
        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">我</div>
        <div className="flex-1 flex gap-1.5">
          <input value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="发表评论..." className="flex-1 text-[12px] border border-gray-100 rounded-lg px-3 py-1.5 outline-none bg-gray-50 focus:bg-white focus:border-gray-200 transition-colors placeholder:text-gray-300" />
          <button onClick={submit} disabled={!content.trim() || submitting}
            className="px-2.5 py-1.5 bg-blue-500 text-white text-[11px] rounded-lg hover:bg-blue-600 disabled:opacity-30 transition-colors flex-shrink-0">
            {submitting ? '...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
