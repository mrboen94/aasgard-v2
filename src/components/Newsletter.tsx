import { MailIcon } from '../components/icons/MailIcon'
import { Button } from '../components/Button'
import { ResourcePattern } from '@/components/ResourcePattern'
import { useMotionValue } from 'framer-motion'

export function Newsletter() {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)
  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }
  return (
    <form
      name="newsletter"
      action="/thank-you"
      method="POST"
      className="group relative rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
      data-netlify="true"
      onMouseMove={onMouseMove}
    >
      <ResourcePattern mouseX={mouseX} mouseY={mouseY} />
      <input type="hidden" name="form-name" value="newsletter" />
      <h2 className="relative flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="relative mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="relative mt-6 flex">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          aria-label="Email address"
          required
          className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 group-hover:ring-1 group-hover:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
        />
        <Button
          type="submit"
          variant="secondary"
          className="relative ml-4 flex-none group-hover:ring-1 group-hover:ring-cyan-500 dark:group-hover:ring-teal-500"
        >
          Join
        </Button>
      </div>
    </form>
  )
}
