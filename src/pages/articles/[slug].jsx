import groq from 'groq'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { ArticleLayout } from '@/components/ArticleLayout'
import remarkGfm from 'remark-gfm'
import rehypePrism from '@mapbox/rehype-prism'

import client from '../../../client'

const Article = ({ article, body }) => {
  return article ? (
    <ArticleLayout meta={article}>
      <MDXRemote {...body} />
    </ArticleLayout>
  ) : (
    <div>nothing</div>
  )
}

// Choses what information to save as an article object
const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  "name": author->name,
  "categories": categories[]->title,
  "authorImage": author->image,
  "mainImage": mainImage.asset,
  "metadata": mainImage.asset->metadata, 
  "createdAt": _createdAt,
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
