// Postgres: a moved array row inherits the relationship stored at its new position
import { getPayload } from 'payload'
import config from './payload.config'
const payload = await getPayload({ config })
const note = await payload.create({ overrideAccess: true, collection: 'notes', data: { title: 'target' } })
const m = await payload.create({ overrideAccess: true,
  collection: 'menus',
  data: { links: [{ name: 'First', type: 'internal', reference: { relationTo: 'notes', value: note.id } }, { name: 'Login', type: 'external' }] } as any,
})
const [first, login] = m.links as any[]
await payload.update({ overrideAccess: true,
  collection: 'menus',
  id: m.id,
  data: {
    links: [
      { id: login.id, name: 'Login', type: 'external' },
      { id: first.id, name: 'First', type: 'internal', reference: { relationTo: 'notes', value: note.id } },
    ],
  } as any,
})
const after = await payload.findByID({ overrideAccess: true, collection: 'menus', id: m.id, depth: 0 })
const l = (after.links as any[]).find((x) => x.name === 'Login')
const rels = await (payload.db as any).pool.query('select path, notes_id, parent_id from menus_rels order by id')
console.log('menus_rels rows:', JSON.stringify(rels.rows))
console.log('observed Login.reference:', l.reference, ' expected: null/undefined')
console.log(l.reference ? 'REPRODUCED' : 'NOT REPRODUCED')
process.exit(0)
