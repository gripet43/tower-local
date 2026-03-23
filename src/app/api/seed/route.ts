import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  const D = (s: string) => new Date(s)

  try {
    // Try to create tables using raw SQL (avoids needing prisma CLI at runtime)
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Project" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Section" ("id" TEXT NOT NULL PRIMARY KEY, "projectId" TEXT NOT NULL, "name" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Tag" ("id" TEXT NOT NULL PRIMARY KEY, "projectId" TEXT NOT NULL, "name" TEXT NOT NULL, "color" TEXT NOT NULL DEFAULT '#6B7280', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE, UNIQUE("projectId", "name"))`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Task" ("id" TEXT NOT NULL PRIMARY KEY, "projectId" TEXT NOT NULL, "sectionId" TEXT, "title" TEXT NOT NULL, "taskNumber" INTEGER NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "completed" BOOLEAN NOT NULL DEFAULT false, "dueDate" DATETIME, "priority" TEXT NOT NULL DEFAULT 'normal', "description" TEXT NOT NULL DEFAULT '', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE, FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Subtask" ("id" TEXT NOT NULL PRIMARY KEY, "taskId" TEXT NOT NULL, "title" TEXT NOT NULL, "completed" BOOLEAN NOT NULL DEFAULT false, "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Comment" ("id" TEXT NOT NULL PRIMARY KEY, "taskId" TEXT NOT NULL, "content" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "ActivityLog" ("id" TEXT NOT NULL PRIMARY KEY, "taskId" TEXT NOT NULL, "actionType" TEXT NOT NULL, "oldValue" TEXT, "newValue" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Attachment" ("id" TEXT NOT NULL PRIMARY KEY, "taskId" TEXT NOT NULL, "fileName" TEXT NOT NULL, "fileSize" INTEGER NOT NULL, "filePath" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE)`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "TaskTag" ("id" TEXT NOT NULL PRIMARY KEY, "taskId" TEXT NOT NULL, "tagId" TEXT NOT NULL, FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE, FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE)`

    // Clean
    try {
      await prisma.taskTag.deleteMany()
      await prisma.activityLog.deleteMany()
      await prisma.comment.deleteMany()
      await prisma.subtask.deleteMany()
      await prisma.attachment.deleteMany()
      await prisma.task.deleteMany()
      await prisma.tag.deleteMany()
      await prisma.section.deleteMany()
      await prisma.project.deleteMany()
    } catch { /* ignore */ }

    // 投递
    const p1 = await prisma.project.create({ data: { name: '投递' } })
    const s1 = await prisma.section.create({ data: { projectId: p1.id, name: 'XX创新中心', sortOrder: 0 } })
    const s2 = await prisma.section.create({ data: { projectId: p1.id, name: '全部', sortOrder: 1 } })
    const tag1 = await prisma.tag.create({ data: { projectId: p1.id, name: '重要', color: '#e74c3c' } })
    const tag2 = await prisma.tag.create({ data: { projectId: p1.id, name: '待学习', color: '#3498db' } })

    const t1 = await prisma.task.create({ data: { projectId: p1.id, sectionId: s1.id, title: '完成项目提案文档', taskNumber: 1, sortOrder: 0, dueDate: D('2026-04-30'), priority: 'high',
      description: '需要在月底前完成 XX 创新中心的项目提案，包含技术方案、时间排期和预算预估。\n\n主要章节：\n1. 项目背景与目标\n2. 技术架构设计\n3. 里程碑规划\n4. 资源与预算\n5. 风险评估' } })
    await prisma.task.create({ data: { projectId: p1.id, sectionId: s1.id, title: '准备面试材料', taskNumber: 2, sortOrder: 1, dueDate: D('2026-04-28'), priority: 'medium' } })
    await prisma.task.create({ data: { projectId: p1.id, sectionId: s1.id, title: '联系HR确认时间', taskNumber: 3, sortOrder: 2 } })
    const t4 = await prisma.task.create({ data: { projectId: p1.id, sectionId: s2.id, title: '复习数量关系真题', taskNumber: 4, sortOrder: 0, dueDate: D('2026-04-25'), priority: 'medium' } })
    await prisma.task.create({ data: { projectId: p1.id, sectionId: s2.id, title: '听花生十三课程', taskNumber: 5, sortOrder: 1 } })
    await prisma.task.create({ data: { projectId: p1.id, sectionId: s2.id, title: '整理桌面文件', taskNumber: 6, sortOrder: 2, priority: 'low' } })
    await prisma.task.create({ data: { projectId: p1.id, sectionId: s2.id, title: '回复邮件', taskNumber: 7, sortOrder: 3 } })
    await prisma.task.create({ data: { projectId: p1.id, sectionId: s2.id, title: '更新简历', taskNumber: 8, sortOrder: 4, dueDate: D('2026-04-20'), priority: 'high' } })

    await prisma.subtask.create({ data: { taskId: t1.id, title: '需求分析', sortOrder: 0 } })
    await prisma.subtask.create({ data: { taskId: t1.id, title: '技术方案', sortOrder: 1, completed: true } })
    await prisma.subtask.create({ data: { taskId: t1.id, title: '排期计划', sortOrder: 2 } })
    await prisma.subtask.create({ data: { taskId: t4.id, title: '第一轮：2024年真题', sortOrder: 0, completed: true } })
    await prisma.subtask.create({ data: { taskId: t4.id, title: '第二轮：错题重做', sortOrder: 1 } })

    await prisma.taskTag.create({ data: { taskId: t1.id, tagId: tag1.id } })
    await prisma.taskTag.create({ data: { taskId: t4.id, tagId: tag2.id } })

    await prisma.comment.create({ data: { taskId: t1.id, content: '技术方案部分需要和架构组确认接口定义，已发消息给老王，等回复中。' } })
    await prisma.comment.create({ data: { taskId: t1.id, content: '排期计划调整了：设计稿确认延后 2 天，整体 deadline 不变。' } })

    await prisma.activityLog.create({ data: { taskId: t1.id, actionType: 'created', newValue: '完成项目提案文档' } })
    await prisma.activityLog.create({ data: { taskId: t1.id, actionType: 'due_date_changed', newValue: '2026-04-30' } })
    await prisma.activityLog.create({ data: { taskId: t1.id, actionType: 'priority_changed', oldValue: '普通', newValue: '高' } })

    // 生活
    const p2 = await prisma.project.create({ data: { name: '生活' } })
    await prisma.task.create({ data: { projectId: p2.id, title: '买菜', taskNumber: 1, sortOrder: 0, description: '西红柿、鸡蛋、青菜、豆腐、五花肉。' } })
    const t10 = await prisma.task.create({ data: { projectId: p2.id, title: '还信用卡', taskNumber: 2, sortOrder: 1, dueDate: D('2026-04-15'), priority: 'high' } })
    await prisma.comment.create({ data: { taskId: t10.id, content: '招行本月 5023 元，工行 1280 元。' } })

    // 随便写
    const p3 = await prisma.project.create({ data: { name: '随便写' } })
    await prisma.task.create({ data: { projectId: p3.id, title: '记录今天的灵感', taskNumber: 1, sortOrder: 0, priority: 'low', description: '用英文写一个简单的日记应用试试，主要练习口语和写作。' } })
    await prisma.task.create({ data: { projectId: p3.id, title: '研究 Svelte', taskNumber: 2, sortOrder: 1, description: '看看 Svelte 5 的 runes 模式，对比 React hooks。' } })

    return NextResponse.json({ ok: true, message: '种子数据创建成功！', projects: 3, tasks: 10 })
  } catch (e: unknown) {
    console.error('Seed error:', e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error', stack: e instanceof Error ? e.stack : '' }, { status: 500 })
  }
}
