import Head from 'next/head'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { formatDate } from '@/lib/formatDate'
import { getAllArticles } from '@/lib/getAllArticles'
import AnimatedCard from '@/components/AnimatedLinkCard'

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
        <AnimatedCard data={article} date={true} />
      </div>
    </article>
  )
}

export default function ArticlesIndex({ articles }) {
  return (
    <>
      <Head>
        <title>Articles - Mathias Bøe</title>
        <meta
          name="description"
          content="All of my long-form thoughts on programming, product design, and more, collected in chronological order."
        />
      </Head>
      <SimpleLayout
        title="Writing on software, design, photography and fun stuff that I want to write about."
        intro="All of my long-form thoughts on programming, design, photography, and more, collected in chronological order."
      >
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {articles.map((article) => (
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
