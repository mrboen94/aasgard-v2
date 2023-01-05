import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Link from 'next/link'
import { Card } from './Card'
import { formatDate } from '@/lib/formatDate'
import { GridPattern } from './GridPattern'

function ResourcePattern({ mouseX, mouseY }) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 hidden rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] hover:block group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="dark:fill-white/1 dark:stroke-white/2.5 absolute inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 sm:-inset-x-6"
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-100 to-cyan-100 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-teal-900/40 dark:to-cyan-900/40"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="dark:fill-white/2.5 absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:stroke-white/10"
        />
      </motion.div>
    </div>
  )
}

export default function AnimatedCard({ data }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <Link href={`/articles/${data.slug.current}`}>
      <div
        key={data.slug.current}
        onMouseMove={onMouseMove}
        className="group relative -inset-y-4 mx-auto flex rounded-2xl bg-white ring-1 ring-inset ring-gray-200/50 transition-all duration-300 hover:scale-100 hover:shadow-md hover:shadow-zinc-900/5 dark:bg-zinc-900 dark:ring-gray-200/5 dark:hover:bg-zinc-800 dark:hover:shadow-black/5 sm:-inset-x-6"
      >
        <ResourcePattern mouseX={mouseX} mouseY={mouseY} />
        <div className="absolute inset-0 rounded-2xl transition-all" />
        <div className="relative rounded-2xl p-6 px-6">
          <div>
            <time
              dateTime={data.publishedAt}
              className="order-first flex items-center font-mono text-base text-zinc-400 dark:text-zinc-500"
            >
              <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
              <span className="ml-3">{formatDate(data.publishedAt)}</span>
            </time>
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            {data.title}
          </span>
          <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white"></h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {data.description}
          </p>
          <Card.Cta>Read article</Card.Cta>
        </div>
      </div>
    </Link>
  )
}
