import groq from 'groq'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { ArticleLayout } from '@/components/ArticleLayout'
import remarkGfm from 'remark-gfm'
import rehypePrism from '@mapbox/rehype-prism'
import Video from '@/components/Video'
import PhysicsImage from '../../components/PhysicsImage'

import client from '../../../client'

const components = { Video, PhysicsImage }

const Article = ({ article, body }) => {
  return article ? (
    <ArticleLayout meta={article}>
      <div>
        <MDXRemote {...body} components={components} lazy />
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

export async function getStaticPaths() {
  const paths = await client.fetch(
    groq`*[_type == "post" && defined(slug.current)][].slug.current`
  )

  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: true,
  }
}

export async function getStaticProps(context) {
  const { slug = '' } = context.params
  const article = await client.fetch(query, { slug })
  const mdxSoruce = await serialize(article.body, {
    mdxOptions: {
      rehypePlugins: [rehypePrism],
      remarkPlugins: [remarkGfm],
    },
  })
  return {
    props: {
      article,
      body: mdxSoruce,
    },
  }
}
export default Article
