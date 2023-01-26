import Head from 'next/head'
import { SimpleLayout } from '@/components/SimpleLayout'
import { formatDate } from '@/lib/formatDate'
import { getAllArticles } from '@/lib/getAllArticles'
import { AnimatedLinkCard } from '@/components/AnimatedLinkCard'
import { useState } from 'react'

function Article({ article }) {
  return (
    <article className="gap-x-0 md:grid md:grid-cols-2 md:items-baseline">
      <time
        dateTime={article.publishedAt}
        className="my-auto mx-0 mt-1 -ml-6 hidden w-40 pl-4 md:block"
      >
        <p className="font-mono text-sm text-zinc-400 dark:text-zinc-500">
          {formatDate(article.publishedAt)}
        </p>
      </time>
      <div className="inset-0 sm:ml-10 md:-ml-36">
        <AnimatedLinkCard data={article} date={true} />
      </div>
    </article>
  )
}

export default function ArticlesIndex({ articles }) {
  const [languageSelect, setLanguageSelect] = useState('')

  return (
    <>
      <Head>
        <title>Articles - Mathias Bøe</title>
        <meta
          name="description"
          content="All of my long-form thoughts on programming, product design, and more, collected in chronological order."
        />
      </Head>
      <span className="mx-auto mt-8 -mb-12 flex w-full items-center justify-center lg:-mb-24 lg:mt-14">
        <button
          className="mx-4 h-8 w-8 items-center justify-center rounded-full bg-zinc-100 pt-1 ring-1 ring-zinc-300 hover:ring-cyan-400 dark:bg-zinc-900 dark:ring-zinc-600 hover:dark:ring-teal-500 lg:mx-2 lg:h-7 lg:w-7"
          onClick={() => setLanguageSelect(languageSelect === 'en' ? '' : 'en')}
        >
          🇬🇧
        </button>
        <button
          className="mx-4 h-8 w-8 items-center justify-center rounded-full bg-zinc-100 pt-1 ring-1 ring-zinc-300 hover:ring-cyan-400 dark:bg-zinc-900 dark:ring-zinc-600 hover:dark:ring-teal-500 lg:mx-2 lg:h-7 lg:w-7"
          onClick={() => setLanguageSelect('')}
        >
          🏳️
        </button>
        <button
          className="mx-4 h-8 w-8 items-center justify-center rounded-full bg-zinc-100 pt-1 ring-1 ring-zinc-300 hover:ring-cyan-400 dark:bg-zinc-900 dark:ring-zinc-600 hover:dark:ring-teal-500 lg:mx-2 lg:h-7 lg:w-7"
          onClick={() => setLanguageSelect(languageSelect === 'no' ? '' : 'no')}
        >
          🇳🇴
        </button>
      </span>
      <SimpleLayout
        className="min-h-screen"
        title="Writing on software, design, photography and fun stuff that I want to write about."
        intro="All of my long-form thoughts on programming, design, photography, and more, collected in chronological order."
      >
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <span className="flex text-slate-50" />
          <div className="flex max-w-3xl flex-col space-y-16">
            {articles
              .filter(
                (article) =>
                  article.language === languageSelect || languageSelect === ''
              )
              .map((article) => (
                <Article key={article.slug.current} article={article} />
              ))}
          </div>
        </div>
      </SimpleLayout>
    </>
  )
}

export async function getStaticProps() {
  const articles = await getAllArticles()
  return {
    props: {
      articles,
    },
  }
}
