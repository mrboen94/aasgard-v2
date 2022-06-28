import Image from 'next/image'
import { fill } from 'tailwindcss/defaultTheme'

export default function InlineImage({ title, description, src, alt }) {
  return (
    <div className="group relative rounded-lg">
      <h2 className="mt-4 font-display text-base text-slate-900 dark:text-white">
        {title && title}
      </h2>
      <Image src={src} alt={alt} width="200px" height="200px" />
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-400">
        {description && description}
      </p>
    </div>
  )
}
