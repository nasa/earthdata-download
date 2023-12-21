exports.up = (knex) => knex.schema.table('preferences', (table) => {
  table.boolean('hasMetricsPreferenceBeenSet').defaultTo(false)
})

exports.down = (knex) => knex.schema.table('preferences', (table) => {
  table.dropColumn('hasMetricsPreferenceBeenSet')
})
