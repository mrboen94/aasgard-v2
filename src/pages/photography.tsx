import { SimpleLayout } from '@/components/SimpleLayout'
import client from '../../client'
import groq from 'groq'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Lightbox from 'yet-another-react-lightbox'
import PhotoAlbum from 'react-photo-album'
import { useEffect, useState } from 'react'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Head from 'next/head'

export default function Photography({ images, title, description }) {
  const [headTitle, setHeadTitle] = useState('Photography 📷 - Mathias Bøe')

  useEffect(() => {
    window.addEventListener('mousedown', (event) => {
      setHeadTitle('Photography 📸 - Mathias Bøe')
    })
    window.addEventListener('mouseup', (event) => {
      setHeadTitle('Photography 📷 - Mathias Bøe')
    })
  }, [])

  const [index, setIndex] = useState(-1)
  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="description" content="Photography - Mathias Bøe" />
      </Head>
      <SimpleLayout title={title} intro={description}>
        <PhotoAlbum
          layout="rows"
          photos={images}
          onClick={({ index }) => setIndex(index)}
        />
        <Lightbox
          slides={images}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          // enable optional lightbox plugins
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        />
      </SimpleLayout>
    </>
  )
}

export async function getStaticProps() {
  const res = await client.fetch(groq`
    *[_type == "photography"]{
        images[] {
            "src": image.asset->url,
            "width": image.asset->metadata.dimensions.width,
            "height": image.asset->metadata.dimensions.height,
        },
        title,
        description
    }[0]`)

  return {
    props: {
      images: res.images ?? null,
      title: res.title ?? null,
      description: res.description ?? null,
    },
  }
}
