'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string | null
  onChange: (date: string | null) => void
  isOverdue?: boolean
}

export default function DatePicker({ value, onChange, isOverdue }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = value ? new Date(value) : new Date()
  const [viewYear, setViewYear] = useState(current.getFullYear())
  const [viewMonth, setViewMonth] = useState(current.getMonth())

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const DAYS = ['日', '一', '二', '三', '四', '五', '六']
  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const today = new Date()
  const selected = value ? new Date(value) : null

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const selectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day, 12, 0, 0)
    onChange(d.toISOString().slice(0, 10))
    setOpen(false)
  }

  const clearDate = () => { onChange(null); setOpen(false) }
  const setToday = () => { onChange(today.toISOString().slice(0, 10)); setOpen(false) }
  const setTomorrow = () => { const d = new Date(today); d.setDate(d.getDate() + 1); onChange(d.toISOString().slice(0, 10)); setOpen(false) }
  const setNextWeek = () => { const d = new Date(today); d.setDate(d.getDate() + 7); onChange(d.toISOString().slice(0, 10)); setOpen(false) }

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`hover:text-blue-500 transition-colors cursor-pointer text-[10px] tabular-nums ${isOverdue ? 'text-red-400' : ''}`}>
        {value ? formatDate(value) : '—'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 w-[260px] p-3">
          {/* Quick actions */}
          <div className="flex gap-1 mb-2">
            <QuickBtn onClick={setToday}>今天</QuickBtn>
            <QuickBtn onClick={setTomorrow}>明天</QuickBtn>
            <QuickBtn onClick={setNextWeek}>下周</QuickBtn>
            {value && <QuickBtn onClick={clearDate} cls="text-red-400 hover:bg-red-50">清除</QuickBtn>}
          </div>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2 px-1">
            <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 p-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <span className="text-[12px] font-medium text-gray-700">{viewYear}年{monthNames[viewMonth]}</span>
            <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 p-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-gray-400 py-0.5">{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0">
            {cells.map((day, i) => (
              <div key={i} className="text-center py-0.5">
                {day && (
                  <button onClick={() => selectDay(day)}
                    className={`w-7 h-7 rounded-full text-[12px] transition-colors ${
                      selected && isSameDay(selected, new Date(viewYear, viewMonth, day))
                        ? 'bg-blue-500 text-white font-medium'
                        : isSameDay(today, new Date(viewYear, viewMonth, day))
                          ? 'bg-blue-50 text-blue-600 font-medium hover:bg-blue-100'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QuickBtn({ onClick, children, cls = '' }: { onClick: () => void; children: React.ReactNode; cls?: string }) {
  return (
    <button onClick={onClick} className={`text-[11px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors ${cls}`}>
      {children}
    </button>
  )
}

function formatDate(d: string) {
  const date = new Date(d)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (isSameDay(date, today)) return '今天'
  if (isSameDay(date, tomorrow)) return '明天'
  return `${date.getMonth()+1}月${date.getDate()}日`
}
