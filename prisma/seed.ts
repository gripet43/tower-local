import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const D = (s: string) => new Date(s)

async function main() {
  await prisma.taskTag.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.subtask.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.section.deleteMany()
  await prisma.project.deleteMany()

  const proj1 = await prisma.project.create({ data: { name: '投递' } })
  const s1 = await prisma.section.create({ data: { projectId: proj1.id, name: 'XX创新中心', sortOrder: 0 } })
  const s2 = await prisma.section.create({ data: { projectId: proj1.id, name: '全部', sortOrder: 1 } })

  const tag1 = await prisma.tag.create({ data: { projectId: proj1.id, name: '重要', color: '#e74c3c' } })
  const tag2 = await prisma.tag.create({ data: { projectId: proj1.id, name: '待学习', color: '#3498db' } })
  await prisma.tag.create({ data: { projectId: proj1.id, name: '个人', color: '#2ecc71' } })

  const t1 = await prisma.task.create({ data: { projectId: proj1.id, sectionId: s1.id, title: '完成项目提案文档', taskNumber: 1, sortOrder: 0, dueDate: D('2026-04-30'), priority: 'high',
    description: '需要在月底前完成 XX 创新中心的项目提案，包含技术方案、时间排期和预算预估。\n\n主要章节：\n1. 项目背景与目标\n2. 技术架构设计\n3. 里程碑规划\n4. 资源与预算\n5. 风险评估' } })
  await prisma.task.create({ data: { projectId: proj1.id, sectionId: s1.id, title: '准备面试材料', taskNumber: 2, sortOrder: 1, dueDate: D('2026-04-28'), priority: 'medium' } })
  await prisma.task.create({ data: { projectId: proj1.id, sectionId: s1.id, title: '联系HR确认时间', taskNumber: 3, sortOrder: 2 } })
  const t4 = await prisma.task.create({ data: { projectId: proj1.id, sectionId: s2.id, title: '复习数量关系真题', taskNumber: 4, sortOrder: 0, dueDate: D('2026-04-25'), priority: 'medium' } })
  await prisma.task.create({ data: { projectId: proj1.id, sectionId: s2.id, title: '听花生十三课程', taskNumber: 5, sortOrder: 1 } })
  await prisma.task.create({ data: { projectId: proj1.id, sectionId: s2.id, title: '整理桌面文件', taskNumber: 6, sortOrder: 2, priority: 'low' } })
  await prisma.task.create({ data: { projectId: proj1.id, sectionId: s2.id, title: '回复邮件', taskNumber: 7, sortOrder: 3 } })
  await prisma.task.create({ data: { projectId: proj1.id, sectionId: s2.id, title: '更新简历', taskNumber: 8, sortOrder: 4, dueDate: D('2026-04-20'), priority: 'high' } })

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

  const proj2 = await prisma.project.create({ data: { name: '生活' } })
  await prisma.task.create({ data: { projectId: proj2.id, title: '买菜', taskNumber: 1, sortOrder: 0, description: '西红柿、鸡蛋、青菜、豆腐、五花肉。' } })
  const t10 = await prisma.task.create({ data: { projectId: proj2.id, title: '还信用卡', taskNumber: 2, sortOrder: 1, dueDate: D('2026-04-15'), priority: 'high' } })
  await prisma.comment.create({ data: { taskId: t10.id, content: '招行本月 5023 元，工行 1280 元。' } })

  const proj3 = await prisma.project.create({ data: { name: '随便写' } })
  await prisma.task.create({ data: { projectId: proj3.id, title: '记录今天的灵感', taskNumber: 1, sortOrder: 0, priority: 'low', description: '用英文写一个简单的日记应用试试，主要练习口语和写作。' } })
  await prisma.task.create({ data: { projectId: proj3.id, title: '研究 Svelte', taskNumber: 2, sortOrder: 1, description: '看看 Svelte 5 的 runes 模式，对比 React hooks。' } })

  console.log('Seed 完成！')
}

main().catch(console.error).finally(() => prisma.$disconnect())
