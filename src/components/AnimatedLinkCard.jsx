import { useMotionValue } from 'framer-motion'
import Link from 'next/link'
import { Card } from './Card'
import { formatDate } from '@/lib/formatDate'
import { ResourcePattern } from './ResourcePattern'

export function AnimatedLinkCard({ data, date }) {
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
        className="group relative -inset-y-4 mx-auto flex rounded-2xl bg-white ring-1 ring-inset ring-gray-200/50 transition-all duration-500 hover:scale-100 hover:shadow-md hover:shadow-zinc-900/5 hover:ring-gray-300/50 dark:bg-zinc-900 dark:ring-gray-200/5 dark:hover:shadow-black/5 dark:hover:ring-gray-200/10 sm:-inset-x-6"
      >
        <ResourcePattern mouseX={mouseX} mouseY={mouseY} />
        <div className="absolute inset-0 rounded-2xl transition-all" />
        <div className="relative rounded-2xl p-6 px-6">
          {!date && (
            <time
              dateTime={data.publishedAt}
              className="order-first flex items-center font-mono text-base text-zinc-400 dark:text-zinc-500"
            >
              <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
              <span className="ml-3">{formatDate(data.publishedAt)}</span>
              <span className="ml-2">
                | {data.language === 'en' ? '🇬🇧 English' : '🇳🇴 Norwegian'}
              </span>
            </time>
          )}
          <span className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            <h2>{`${data.title}`}</h2>
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
