import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'

// One config for every reproduction in this repo. Each repro-<n>.ts uses only part of it.
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  localization: { locales: ['en', 'fr'], defaultLocale: 'en' },
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: true }),
  collections: [
    {
      // repro-1, repro-4
      slug: 'pages',
      versions: { drafts: { localizeStatus: true } },
      fields: [
        {
          name: 'items',
          type: 'array',
          fields: [{ name: 'label', type: 'text', localized: true, required: true }],
        },
      ],
    },
    {
      // repro-2, repro-5
      slug: 'notes',
      fields: [{ name: 'title', type: 'text', required: true }],
    },
    {
      // repro-5
      slug: 'menus',
      fields: [
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'type', type: 'select', options: ['internal', 'external'] },
            {
              name: 'reference',
              type: 'relationship',
              relationTo: ['notes'],
              admin: { condition: (_, s) => s?.type === 'internal' },
            },
          ],
        },
      ],
    },
  ],
  globals: [
    {
      // repro-1
      slug: 'footer',
      versions: { drafts: { localizeStatus: true } },
      fields: [
        {
          name: 'links',
          type: 'array',
          fields: [{ name: 'label', type: 'text', localized: true }],
        },
      ],
    },
  ],
})
