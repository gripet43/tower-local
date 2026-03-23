'use client'
import { useState, useRef, useCallback } from 'react'

interface Props {
  description: string
  onUpdate: (d: Record<string, unknown>) => Promise<void>
}

export default function TaskDescriptionEditor({ description, onUpdate }: Props) {
  const [desc, setDesc] = useState(description)
  const [focused, setFocused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const save = useCallback((v: string) => { clearTimeout(timer.current); timer.current = setTimeout(() => onUpdate({ description: v }), 800) }, [onUpdate])

  return (
    <div>
      <span className="text-[11px] text-gray-400 block mb-1.5">描述</span>
      <div className={`rounded-lg border transition-all ${focused ? 'border-blue-300 bg-white' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'}`}>
        <textarea value={desc} onChange={e => { setDesc(e.target.value); save(e.target.value) }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="添加任务描述..."
          rows={focused ? 4 : (desc ? 2 : 1)}
          className="w-full text-[13px] text-gray-700 leading-relaxed px-3.5 py-2.5 resize-none outline-none bg-transparent rounded-lg placeholder:text-gray-300" />
      </div>
    </div>
  )
}
