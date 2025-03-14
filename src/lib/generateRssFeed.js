// import ReactDOMServer from 'react-dom/server'
// import { Feed } from 'feed'
// import { mkdir, writeFile } from 'fs/promises'
// import { getAllArticles } from './getAllArticles'

export async function generateRssFeed() {
  // let articles = await getAllArticles()
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  let author = {
    name: 'Mathias Bøe',
    email: 'mrboen94@gmail.com',
  }

  /**
  let feed = new Feed({
    title: author.name,
    description: 'Your blog description',
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/rss/feed.xml`,
      json: `${siteUrl}/rss/feed.json`,
    },
  })
   * 
  for (let article of articles) {
    let url = `${siteUrl}/articles/${'article.slug'}` // TODO: Fix slug rss feeds
    let html = ReactDOMServer.renderToStaticMarkup(
      <article.component isRssFeed />
    )

    feed.addItem({
      title: 'Title also needs to be fixed at a later point', //article.title,
      id: url,
      link: url,
      description: 'This is just a description that needs to be added later', //article[0].description,
      content: html,
      author: [author],
      contributor: [author],
      date: new Date(article.date),
    })
  }

  await mkdir('./public/rss', { recursive: true })
  await Promise.all([
    writeFile('./public/rss/feed.xml', feed.rss2(), 'utf8'),
    writeFile('./public/rss/feed.json', feed.json1(), 'utf8'),
  ])
   */
}
