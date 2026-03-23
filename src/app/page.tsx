'use client'
import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  createdAt: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => setProjects(data))
  }, [])

  const onSeed = async () => {
    setSeeding(true)
    await fetch('/api/seed', { method: 'POST' })
    const data = await fetch('/api/projects').then(r => r.json())
    setProjects(data)
    setSeeding(false)
  }

  if (projects === null) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f4f7f0' }}>
        <p className="text-[13px] text-gray-400">加载中...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f4f7f0' }}>
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200/50 px-8 py-10">
          <h1 className="text-[22px] font-bold text-gray-800 mb-2">Tower</h1>
          <p className="text-[13px] text-gray-400 mb-5">暂无项目数据</p>
          <button onClick={onSeed} disabled={seeding}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-[13px] rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {seeding ? '创建中...' : '初始化示例数据'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f4f7f0' }}>
      <div className="max-w-[960px] mx-auto px-6 py-10">
        <h1 className="text-[20px] font-bold text-gray-800 mb-6">Tower</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <a key={p.id} href={`/projects/${p.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200/60 px-5 py-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-[15px] font-semibold text-gray-800">{p.name}</div>
              <div className="text-[12px] text-gray-400 mt-1">
                {new Date(p.createdAt).toLocaleDateString('zh-CN')}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
