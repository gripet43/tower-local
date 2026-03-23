import { PrismaClient } from '@prisma/client'

export default async function Home() {
  try {
    const prisma = new PrismaClient()
    const first = await prisma.project.findFirst({ orderBy: { createdAt: 'asc' } })
    if (first) {
      const { redirect } = await import('next/navigation')
      redirect(`/projects/${first.id}`)
    }
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f4f7f0' }}>
        <div className="text-center">
          <h1 className="text-[20px] font-bold text-gray-800 mb-3">Tower</h1>
          <p className="text-[13px] text-gray-400 mb-4">暂无项目</p>
          <p className="text-[11px] text-gray-300">运行 <code className="bg-gray-100 px-1.5 py-0.5 rounded">npx tsx prisma/seed.ts</code> 添加种子数据</p>
        </div>
      </div>
    )
  } catch {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f4f7f0' }}>
        <div className="text-center">
          <h1 className="text-[20px] font-bold text-gray-800 mb-3">Tower</h1>
          <p className="text-[13px] text-gray-400">数据库未初始化</p>
        </div>
      </div>
    )
  }
}
