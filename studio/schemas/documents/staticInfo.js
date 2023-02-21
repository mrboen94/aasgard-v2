export default {
  name: 'staticInfo',
  title: 'Static Info',
  type: 'document',
  groups: [
    {
      name: 'home',
      title: 'Home',
    },
    {
      name: 'about',
      title: 'About',
    },
    {
      name: 'contact',
      title: 'Contact',
    },
    {
      name: 'projects',
      title: 'Projects',
    },
    {
      name: 'uses',
      title: 'Uses',
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
    {
      name: 'homeTitle',
      title: 'Home Title',
      type: 'string',
      group: 'home',
    },
    {
      name: 'homeDescription',
      title: 'Home Description',
      type: 'string',
      group: 'home',
    },
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'home',
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'string',
      group: 'home',
    },
    {
      name: 'bioTitle',
      title: 'Bio Title',
      type: 'string',
      group: 'about',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'markdown',
      group: 'about',
    },
    {
      name: 'profileImage',
      title: 'Profile Image',
      type: 'imageWithAlt',
      group: 'about',
    },
    {
      name: 'contact',
      title: 'Contact',
      type: 'social',
      group: 'contact',
    },
    {
      name: 'projectsTitle',
      title: 'Projects Title',
      type: 'string',
      group: 'projects',
    },
    {
      name: 'projectsDescription',
      title: 'Projects Description',
      type: 'markdown',
      group: 'projects',
    },
    {
      name: 'usesTitle',
      title: 'Uses Title',
      type: 'string',
      group: 'uses',
    },
    {
      name: 'usesDescription',
      title: 'Uses Description',
      type: 'markdown',
      group: 'uses',
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
