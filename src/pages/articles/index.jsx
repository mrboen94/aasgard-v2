import Head from 'next/head'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { formatDate } from '@/lib/formatDate'
import { getAllArticles } from '@/lib/getAllArticles'
import AnimatedCard from '@/components/AnimatedCard'

function Article({ article }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <AnimatedCard data={article} date />
      <Card.Eyebrow
        as="time"
        dateTime={article.publishedAt}
        className="mt-1 hidden md:block"
      >
        {formatDate(article.publishedAt)}
      </Card.Eyebrow>
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
  // It's important to default the slug so that it doesn't return "undefined"
  const articles = await getAllArticles()
  return {
    props: {
      articles,
    },
  }
}
