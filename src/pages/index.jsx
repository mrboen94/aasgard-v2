import { ArrowDownIcon } from '@/components/icons/ArrowDownIcon'
import { BriefcaseIcon } from '@/components/icons/BriefcaseIcon'
import Image from 'next/future/image'
import Head from 'next/head'
import Link from 'next/link'
import clsx from 'clsx'
import groq from 'groq'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import {
  TwitterIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from '@/components/SocialIcons'
import logoIslandgarden from '@/images/logos/islandgarden.svg'
import logoSbanken from '@/images/logos/sbanken.png'
import logoBouvet from '@/images/logos/bouvet.png'
import { generateRssFeed } from '@/lib/generateRssFeed'
import { getAllArticles } from '@/lib/getAllArticles'
import client from 'client'
import { urlFor } from '@/lib/urlFor'
import { AnimatedLinkCard } from '@/components/AnimatedLinkCard'
import { ResourcePattern } from '@/components/ResourcePattern'
import { useMotionValue } from 'framer-motion'
import { Newsletter } from '../components/Newsletter'

function SocialLink({ icon: Icon, ...props }) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  )
}

function Resume() {
  let resume = [
    {
      company: 'Bouvet',
      title: 'Frontend Developer',
      logo: logoBouvet,
      start: '2022',
      end: {
        label: 'Present',
        dateTime: new Date().getFullYear(),
      },
    },
    {
      company: 'IslandGarden',
      title: 'Full Stack developer',
      logo: logoIslandgarden,
      start: '2020',
      end: '2022',
    },
    {
      company: 'Sbanken',
      title: 'Juniordeveloper',
      logo: logoSbanken,
      start: '2019',
      end: '2020',
    },
  ]

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
      className="group relative rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
    >
      <ResourcePattern mouseX={mouseX} mouseY={mouseY} />
      <h2 className="group relative flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="relative h-6 w-6 flex-none" />
        <span className="relative ml-3">Work</span>
      </h2>
      <ol className="relative mt-6 space-y-4">
        {resume.map((role, roleIndex) => (
          <li key={roleIndex} className="flex gap-4">
            <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-zinc-50 shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
              <Image
                src={role.logo}
                alt=""
                className="h-7 w-7 rounded-full"
                unoptimized
              />
            </div>
            <dl className="flex flex-auto flex-wrap gap-x-2">
              <dt className="sr-only">Company</dt>
              <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {role.company}
              </dd>
              <dt className="sr-only">Role</dt>
              <dd className="text-xs text-zinc-500 dark:text-zinc-400">
                {role.title}
              </dd>
              <dt className="sr-only">Date</dt>
              <dd
                className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
                aria-label={`${role.start.label ?? role.start} until ${
                  role.end.label ?? role.end
                }`}
              >
                <time dateTime={role.start.dateTime ?? role.start}>
                  {role.start.label ?? role.start}
                </time>{' '}
                <span aria-hidden="true">—</span>{' '}
                <time dateTime={role.end.dateTime ?? role.end}>
                  {role.end.label ?? role.end}
                </time>
              </dd>
            </dl>
          </li>
        ))}
      </ol>
      <a href="./cv.pdf" download className="relative">
        <Button
          variant="secondary"
          className="group mt-6 w-full duration-500 group-hover:ring-1 group-hover:ring-cyan-500 dark:group-hover:ring-teal-500"
        >
          Download CV (Norwegian)
          <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-hover:animate-bounce group-hover:stroke-cyan-600 group-active:stroke-zinc-600 dark:group-hover:stroke-teal-300 first-letter:dark:group-active:stroke-zinc-50" />
        </Button>
      </a>
    </div>
  )
}

function Photos({ images }) {
  let rotations = [
    'rotate-2 hover:rotate-0',
    '-rotate-2 hover:rotate-0',
    'rotate-2 hover:rotate-0',
    'rotate-2 hover:rotate-0',
    '-rotate-2 hover:rotate-0',
  ]
  return (
    <div className="mt-16 sm:mt-20">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
        {images.map((image, imageIndex) => (
          <div
            key={image.alt}
            className={clsx(
              'relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 transition-transform duration-500 dark:bg-zinc-800 sm:w-72 sm:rounded-2xl',
              rotations[imageIndex % rotations.length]
            )}
          >
            <Image
              src={urlFor(image.image)}
              alt={image.alt}
              sizes="(min-width: 640px) 18rem, 11rem"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-1000"
              width={image.meta.dimensions.width}
              height={image.meta.dimensions.height}
              blurDataURL={image.meta.lqip}
              placeholder="blur"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home({ articles, images }) {
  return (
    <>
      <Head>
        <title>
          Mathias Bøe - Software designer, founder, and amateur astronaut
        </title>
        <meta
          name="description"
          content="I’m Mathias, a software designer and entrepreneur based in New York City. I’m the founder and CEO of Planetaria, where we develop technologies that empower regular people to explore space on their own terms."
        />
      </Head>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Developer, photographer, and amateur designer.
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I’m Mathias, a developer and funnyman based in Bergen. I have a
            passion for frontend (UI/UX) development and seek to create
            interesting experiences for everyone.
          </p>
          <div className="mt-6 flex gap-6">
            <SocialLink
              href="https://twitter.com/mrboen94"
              aria-label="Follow on Twitter"
              icon={TwitterIcon}
            />
            <SocialLink
              href="https://instagram.com/boemathias"
              aria-label="Follow on Instagram"
              icon={InstagramIcon}
            />
            <SocialLink
              href="https://github.com/mrboen94"
              aria-label="Follow on GitHub"
              icon={GitHubIcon}
            />
            <SocialLink
              href="https://linkedin.com/in/boemathias"
              aria-label="Follow on LinkedIn"
              icon={LinkedInIcon}
            />
          </div>
        </div>
      </Container>
      <Photos images={images} />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            {articles &&
              articles.map((article) => (
                <AnimatedLinkCard key={article.slug} data={article} />
              ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Resume />
            <Newsletter />
          </div>
        </div>
      </Container>
    </>
  )
}

export async function getStaticProps() {
  if (process.env.NODE_ENV === 'production') {
    await generateRssFeed()
  }

  const imageArray = await client.fetch(groq`*[_type == "staticInfo"]
    {"images":imageGrid[]
    {
    "image":image.asset, 
    "meta":image.asset->metadata, 
    title, 
    alt, 
    caption}}
`)

  return {
    props: {
      articles: (await getAllArticles()).slice(0, 4),
      images: imageArray[0].images,
    },
  }
}
