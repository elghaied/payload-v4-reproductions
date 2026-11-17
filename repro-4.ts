// Per-locale status: a published locale becomes invalid, then can be neither republished nor unpublished
import { getPayload } from 'payload'
import config from './payload.config'
const payload = await getPayload({ config })
const doc = await payload.create({ overrideAccess: true, collection: 'pages', locale: 'en', data: { _status: 'published', items: [{ label: 'A' }] } as any })
await payload.update({ overrideAccess: true, collection: 'pages', id: doc.id, locale: 'fr', data: { _status: 'published', items: [{ id: doc.items![0].id, label: 'A-fr' }] } as any })
// add an item and publish ENGLISH only
await payload.update({ overrideAccess: true, collection: 'pages', id: doc.id, locale: 'en', data: { _status: 'published', items: [{ id: doc.items![0].id, label: 'A' }, { label: 'B' }] } as any })
const fr = await payload.findByID({ overrideAccess: true, collection: 'pages', id: doc.id, locale: 'fr', draft: false })
console.log('(a) fr published read:', JSON.stringify((fr as any).items?.map((i: any) => i.label)), 'fr _status:', (fr as any)._status, '-> row 2 has empty required label, fr still published')
const attempt = async (name: string, data: any) => {
  try { await payload.update({ overrideAccess: true, collection: 'pages', id: doc.id, locale: 'fr', data }); console.log(name, 'succeeded'); return true }
  catch (e: any) { console.log(name, 'FAILED:', e.message, JSON.stringify(e.data?.errors ?? '')); return false }
}
const republish = await attempt('(b) republish fr', { _status: 'published' })
const unpublish = await attempt('(b) unpublish fr', { _status: 'draft' })
console.log(!unpublish ? 'REPRODUCED (unpublish fails validation; expected success)' : 'NOT REPRODUCED', `[republish ${republish ? 'ok' : 'fails'}]`)
process.exit(0)
