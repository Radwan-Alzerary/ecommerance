/* utils/useIsDesktop.ts */
import { useState, useEffect } from 'react'

export default function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= breakpoint)
    update()                               // التهيئة الأولى عند التحميل
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [breakpoint])

  return isDesktop
}
