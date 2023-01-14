export default {
  name: 'staticInfo',
  title: 'Static Info',
  type: 'document',
  groups: [
    {
      name: 'home',
      title: 'Home',
    },
  ],
  fields: [
    {
      name: 'imageGrid',
      title: 'Image Grid',
      type: 'array',
      group: 'home',
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
