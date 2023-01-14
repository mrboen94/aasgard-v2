import { defineConfig } from 'sanity'
import { languageFilter } from '@sanity/language-filter'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { markdownSchema } from 'sanity-plugin-markdown'
import schemas from './schemas/schema'
import deskStructure from './deskStructure'
import { Logo } from './plugins/aasgardLogo/Logo'

export default defineConfig({
  title: 'aadgard',
  projectId: 'j26i5482',
  dataset: 'production',
  plugins: [
    deskTool({
      structure: deskStructure,
    }),
    visionTool(),
    markdownSchema(),
    languageFilter({
      supportedLanguages: [
        { id: 'nb', title: 'Norwegian (Bokmål)' },
        { id: 'nn', title: 'Norwegian (Nynorsk)' },
        { id: 'en', title: 'English' },
      ],
      // Select Norwegian (Bokmål) by default
      defaultLanguages: ['nn'],
      // Only show language filter for document type `staticInfo` (schemaType.name)
      documentTypes: ['staticInfo'],
      filterField: (enclosingType, field, selectedLanguageIds) =>
        !enclosingType.name.startsWith('locale') ||
        selectedLanguageIds.includes(field.name),
    }),
  ],
  tools: (prev) => {
    // 👇 Uses environment variables set by Vite in development mode
    if (import.meta.env.DEV) {
      return prev
    }
    return prev.filter((tool) => tool.name !== 'vision')
  },

  schema: {
    types: schemas,
  },
  studio: {
    components: {
      logo: Logo,
    },
  },
})
