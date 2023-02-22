export default {
  name: 'imageCard',
  title: 'Image',
  type: 'object',
  fields: [
    {
      title: 'Image',
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['lqip'],
      },
    },
    {
      title: 'Caption',
      name: 'caption',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'caption',
      media: 'image',
    },
    prepare(selection) {
      const { title, media } = selection
      return {
        title: title,
        media: media,
      }
    },
  },
}
