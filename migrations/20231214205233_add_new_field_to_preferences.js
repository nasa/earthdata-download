exports.up = (knex) => knex.schema.table('preferences', (table) => {
  table.boolean('allowMetrics').defaultTo(false)
})

exports.down = (knex) => knex.schema.table('preferences', (table) => {
  table.dropColumn('allowMetrics')
})
