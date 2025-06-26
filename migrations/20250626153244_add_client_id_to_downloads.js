exports.up = (knex) => knex.schema.table('downloads', (table) => {
  table.string('clientId').nullable().defaultTo(null)
})

exports.down = (knex) => knex.schema.table('downloads', (table) => {
  table.dropColumn('clientId')
})
