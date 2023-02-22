import { SimpleLayout } from '@/components/SimpleLayout'
import client from '../../client'
import groq from 'groq'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Lightbox from 'yet-another-react-lightbox'
import PhotoAlbum from 'react-photo-album'
import { useState } from 'react'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

export default function Photography({ images, title, fullResponse }) {
  const [index, setIndex] = useState(-1)
  return (
    <SimpleLayout title={title} intro="Some of my images">
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
        title
    }[0]`)

  return {
    props: {
      images: res.images ?? null,
      title: res.title ?? null,
    },
  }
}
