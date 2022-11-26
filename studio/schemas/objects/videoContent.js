export default {
  name: 'videoContent',
  title: 'Video',
  type: 'object',
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
    },
    {
      title: 'Video URL',
      name: 'videoUrl',
      type: 'string',
    },
    {
      title: 'Description',
      name: 'description',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
    },
    prepare(selection) {
      const { title, description } = selection
      return {
        title: title,
        description: description,
      }
    },
  },
}
