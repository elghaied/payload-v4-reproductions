// A failing operation rolls back a transaction it does not own
import { getPayload } from 'payload'
import config from './payload.config'
const payload = await getPayload({ config })
const tag = `tx-${Date.now()}`
const transactionID = await payload.db.beginTransaction()
const req: any = { payload, transactionID }
await payload.create({ overrideAccess: true, collection: 'notes', data: { title: `${tag}-A` }, req })
console.log('transactionID before failing op:', req.transactionID)
try { await payload.create({ overrideAccess: true, collection: 'notes', data: {} as any, req }) } catch (e: any) { console.log('expected failure:', e.message) }
console.log('transactionID after failing op:', req.transactionID, '(caller owns it; should be unchanged)')
await payload.create({ overrideAccess: true, collection: 'notes', data: { title: `${tag}-C` }, req })
if (req.transactionID) await payload.db.commitTransaction(req.transactionID)
const found = await payload.find({ overrideAccess: true, collection: 'notes', where: { title: { like: tag } }, pagination: false })
const titles = found.docs.map((d) => d.title).sort()
console.log('observed committed:', titles, ' expected: [A, C] together (or loud commit failure)')
console.log(titles.length === 2 ? 'NOT REPRODUCED' : 'REPRODUCED (A lost, C committed alone)')
process.exit(0)
