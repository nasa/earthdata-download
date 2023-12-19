exports.up = (knex) => knex.schema.table('preferences', (table) => {
  table.boolean('allowMetrics').defaultTo(null)
})

exports.down = (knex) => knex.schema.table('preferences', (table) => {
  table.dropColumn('allowMetrics')
})
