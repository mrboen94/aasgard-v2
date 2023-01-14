export default {
  name: 'project',
  title: 'Project',
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
    {
      name: 'link',
      title: 'Link',
      type: 'url',
    },
    {
      name: 'github',
      title: 'Github',
      type: 'url',
    },
    {
      name: 'technologies',
      type: 'array',
      title: 'Technologies',
      description: 'Select the technologies used in this project',
      of: [
        {
          type: 'reference',
          to: [
            {
              type: 'technology',
            },
          ],
        },
      ],
    },
    {
      name: 'completed',
      title: 'Completion date',
      type: 'date',
    },
  ],
}
