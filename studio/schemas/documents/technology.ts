export default {
  name: 'technology',
  title: 'Technology',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'imageWithAlt',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'logo',
      description: 'description',
    },
    prepare({ title, media, description }) {
      return {
        title,
        subtitle: description,
        media: media.image,
      }
    },
  },
}
