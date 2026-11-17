# Payload 4 beta reproductions

Minimal local-API reproductions for bugs found on `payload@4.0.0-beta.9` with `@payloadcms/db-postgres@4.0.0-beta.9`. There is no Next.js app: each script boots Payload with `getPayload`, then prints the observed and expected values and the word `REPRODUCED` or `NOT REPRODUCED`.

## Run

```sh
pnpm install
cp .env.example .env   # point DATABASE_URL at an empty PostgreSQL database
pnpm repro repro-1.ts  # likewise repro-2.ts, repro-4.ts, repro-5.ts
```

The config (`payload.config.ts`) uses `push: true`, so the first run creates the schema.

| Script | Bug |
|---|---|
| `repro-1.ts` | Publishing one locale pairs array rows with the stored rows by index, not id: after a reorder, the other locale's values stay at their old positions. Affects collections **and globals**. |
| `repro-2.ts` | A failing `create` rolls back a transaction the caller owns: `req.transactionID` is deleted, the earlier write is lost, and the next write commits outside any transaction. |
| `repro-4.ts` | With `localizeStatus`, a published locale left with an empty required field after another locale's publish can be neither republished nor unpublished: the unpublish (`_status: 'draft'`) also validates the locale's content. |
| `repro-5.ts` | Postgres: after reordering array rows, a row whose polymorphic relationship is absent inherits the relationship stored in `_rels` at its new index. |
