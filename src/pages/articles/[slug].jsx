import groq from 'groq'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { ArticleLayout } from '@/components/ArticleLayout'
import Video from '@/components/Video'
import PhysicsImage from '../../components/PhysicsImage'
import { CH } from '@code-hike/mdx/components'
import theme from 'shiki/themes/dracula-soft.json'
import { remarkCodeHike } from '@code-hike/mdx'

import client from '../../../client'
export const config = {
  unstable_includeFiles: ['node_modules/**/shiki/**/*.json'],
}

const Article = ({ article, body }) => {
  return article ? (
    <ArticleLayout meta={article}>
      <div className="lg:max-w-7xl">
        <MDXRemote {...body} components={{ Video, PhysicsImage, CH }} lazy />
      </div>
    </ArticleLayout>
  ) : (
    <div>nothing</div>
  )
}

// Choses what information to save as an article object
const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  "authors": author[]->name,
  "categories": categories[]->title,
  "mainImage": mainImage.asset,
  "metadata": mainImage.asset->metadata, 
  "publishedAt": publishedAt,
  body
}`

export async function getStaticProps(context) {
  const { slug = '' } = context.params
  const article = await client.fetch(query, { slug })

  const mdxSoruce = await serialize(article.body, {
    mdxOptions: {
      remarkPlugins: [
        [
          remarkCodeHike,
          {
            autoImport: false,
            lineNumbers: true,
            theme,
            staticMediaQuery: 'not-screen, (max-width: 1070px)',
          },
        ],
      ],
      useDynamicImport: true,
    },
  })
  return {
    props: {
      article,
      body: mdxSoruce,
    },
  }
}

export async function getStaticPaths() {
  const paths = await client.fetch(
    groq`*[_type == "post" && defined(slug.current)][].slug.current`
  )

  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: true,
  }
}

export default Article
