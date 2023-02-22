export default {
  name: 'photography',
  title: 'Photography',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'imageCard' }],
    },
  ],
}
