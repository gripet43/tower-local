'use client'
import { useRef } from 'react'
import { Attachment } from '@/lib/types'
import { fmtFileSize } from '@/lib/utils'

interface Props {
  taskId: string
  attachments: Attachment[]
  onRefresh: () => void
}

export default function AttachmentList({ taskId, attachments, onRefresh }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const fd = new FormData(); fd.append('taskId', taskId); fd.append('file', f)
    await fetch('/api/attachments', { method: 'POST', body: fd })
    onRefresh(); if (fileRef.current) fileRef.current.value = ''
  }

  const del = async (id: string) => {
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] text-gray-400">附件</span>
        <button onClick={() => fileRef.current?.click()} className="text-[12px] text-blue-500 hover:text-blue-700 transition-colors">+ 上传附件</button>
        <input ref={fileRef} type="file" onChange={upload} className="hidden" />
      </div>
      {attachments.length > 0 ? attachments.map(att => (
        <div key={att.id} className="flex items-center gap-2 group text-[13px] py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          <a href={`/api/attachments/${att.id}/download`} className="text-blue-500 hover:underline truncate flex-1">{att.fileName}</a>
          <span className="text-[11px] text-gray-400 flex-shrink-0">{fmtFileSize(att.fileSize)}</span>
          <button onClick={() => del(att.id)} className="text-gray-300 hover:text-red-400 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">删除</button>
        </div>
      )) : (
        <div className="text-[12px] text-gray-300 py-1">暂无附件</div>
      )}
    </div>
  )
}
