import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Tower', description: '本地任务管理' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
