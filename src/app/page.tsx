'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#f4f7f0' }}>
      <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200/50 px-8 py-10">
        <h1 className="text-[22px] font-bold text-gray-800 mb-2">Tower</h1>
        <p className="text-[13px] text-gray-400 mb-5">暂无项目数据</p>
        <SeedButton onDone={() => router.refresh()} />
      </div>
    </div>
  )
}

function SeedButton({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const onClick = async () => {
    setLoading(true)
    await fetch('/api/seed', { method: 'POST' })
    onDone()
    window.location.reload()
  }
  return (
    <button onClick={onClick} disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-[13px] rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
      {loading ? '创建中...' : '初始化示例数据'}
    </button>
  )
}
