import { motion, useMotionTemplate } from 'framer-motion'
import { TopographyPattern } from './svgPatterns/TopographyPattern'

interface IResourcePattern {
  mouseX: any
  mouseY: any
  faded?: boolean
}

export function ResourcePattern({ mouseX, mouseY, faded }: IResourcePattern) {
  let maskImage = faded
    ? useMotionTemplate`radial-gradient(150px at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.3), transparent)`
    : useMotionTemplate`radial-gradient(300px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 hidden rounded-2xl transition-all duration-500 [mask-image:linear-gradient(white,transparent)] hover:block group-hover:opacity-50">
        <TopographyPattern
          width={50}
          height={50}
          x="100%"
          className="dark:fill-white/1 dark:stroke-white/2.5 absolute w-full fill-black/[0.02] stroke-black/5 sm:-inset-x-6"
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-100 to-cyan-100 opacity-0 transition-all duration-500 group-hover:opacity-100 dark:from-teal-900/40 dark:to-cyan-900/40"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <TopographyPattern
          width={28}
          height={48}
          x="100%"
          className="absolute inset-x-0 h-full w-full fill-black/50 stroke-black/50 dark:fill-white/5 dark:stroke-white/10"
        />
      </motion.div>
    </div>
  )
}
