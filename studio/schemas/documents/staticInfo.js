export default {
  name: 'staticInfo',
  title: 'Static Info',
  type: 'document',
  fields: [
    {
      name: 'imageGrid',
      title: 'Image Grid',
      type: 'array',
      of: [{ type: 'imageWithAlt' }],
    },
  ],
  preview: {
    select: {
      title: 'images',
      media: 'images',
    },
    prepare(selection) {
      const { media } = selection
      return {
        title: 'Static Info',
        media: media,
      }
    },
  },
}
