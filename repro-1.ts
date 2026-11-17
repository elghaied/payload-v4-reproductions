// Publishing one locale pairs array rows by position, not id (collection + global)
import { getPayload } from 'payload'
import config from './payload.config'
const payload = await getPayload({ config })
const labels = (items: any[]) => items.map((i) => `${i.id.slice(-4)}:${i.label}`).join(', ')

async function run(kind: 'collection' | 'global') {
  const en = ['A', 'B', 'C'], fr = ['a-fr', 'b-fr', 'c-fr']
  let doc: any
  if (kind === 'collection') {
    doc = await payload.create({ overrideAccess: true, collection: 'pages', locale: 'en', data: { _status: 'published', items: en.map((label) => ({ label })) } as any })
  } else {
    doc = await payload.updateGlobal({ overrideAccess: true, slug: 'footer', locale: 'en', data: { _status: 'published', links: en.map((label) => ({ label })) } as any })
  }
  const key = kind === 'collection' ? 'items' : 'links'
  const rows = doc[key]
  const update = (locale: 'en' | 'fr', data: any) =>
    kind === 'collection'
      ? payload.update({ overrideAccess: true, collection: 'pages', id: doc.id, locale, data: { _status: 'published', ...data } as any })
      : payload.updateGlobal({ overrideAccess: true, slug: 'footer', locale, data: { _status: 'published', ...data } as any })
  await update('fr', { [key]: rows.map((r: any, i: number) => ({ id: r.id, label: fr[i] })) })
  // reverse the rows and publish ENGLISH only (ids kept)
  await update('en', { [key]: [...rows].reverse().map((r: any, i: number) => ({ id: r.id, label: en[rows.length - 1 - i] })) })
  const read = kind === 'collection'
    ? await payload.findByID({ overrideAccess: true, collection: 'pages', id: doc.id, locale: 'fr', draft: false })
    : await payload.findGlobal({ overrideAccess: true, slug: 'footer', locale: 'fr', draft: false })
  const got = (read as any)[key]
  // row id -> its own French label must survive the reorder
  const expected = [...rows].reverse().map((r: any) => `${r.id.slice(-4)}:${fr[rows.indexOf(r)]}`).join(', ')
  const observed = labels(got)
  console.log(`[${kind}] expected fr: ${expected}\n[${kind}] observed fr: ${observed}`)
  console.log(`[${kind}]`, expected === observed ? 'NOT REPRODUCED' : 'REPRODUCED')
}
await run('collection')
await run('global')
process.exit(0)
