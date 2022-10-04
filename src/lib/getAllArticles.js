import groq from 'groq'
import client from '../../client'

async function importArticle(articleFilename) {
  let { meta, default: component } = await import(
    `../pages/articles/${articleFilename}`
  )
  return {
    slug: articleFilename.replace(/(\/index)?\.mdx$/, ''),
    ...meta,
    component,
  }
}

export async function getAllArticles() {
  let articles = await client.fetch(
    groq`*[_type == "post"] | order(_createdAt desc)`
  )

  return articles
}
