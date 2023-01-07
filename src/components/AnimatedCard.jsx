import { useMotionValue } from 'framer-motion'
import { Card } from './Card'
import { formatDate } from '@/lib/formatDate'
import { ResourcePattern } from './ResourcePattern'

export function AnimatedCard({ children }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="group relative -inset-y-4 mx-auto flex rounded-2xl bg-white ring-1 ring-inset ring-gray-200/50 transition-all duration-500 hover:scale-100 hover:shadow-md hover:shadow-zinc-900/5 hover:ring-gray-300/50 dark:bg-zinc-900 dark:ring-gray-200/5 dark:hover:shadow-black/5 dark:hover:ring-gray-200/10 sm:-inset-x-6"
    >
      <div className="relative">{children}</div>
      <ResourcePattern mouseX={mouseX} mouseY={mouseY} />
    </div>
  )
}
