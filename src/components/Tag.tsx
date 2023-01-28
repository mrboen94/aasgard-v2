import { urlFor } from '@/lib/urlFor'
import Image from 'next/image'
import { Logo } from './icons/Logo'

interface ITag {
  icon?: any
  title: string
}

export default function Tag({ icon, title }: ITag) {
  return (
    <div className="relative z-0 text-zinc-800 dark:text-white">
      <span className="group/tag m-2 flex h-8 w-8 flex-col items-center justify-center rounded-full bg-slate-100/75 ring-cyan-300 ring-offset-zinc-800 group-hover:ring-1 dark:bg-zinc-800 dark:ring-teal-300">
        <div className="h-4 w-4">
          <Image src={urlFor(icon.image.asset)} width={16} height={16} />
        </div>
        <p className="translate-all w-fit-content absolute -inset-y-4 hidden h-0 whitespace-nowrap text-center group-hover/tag:block">
          {title}
        </p>
      </span>
    </div>
  )
}
