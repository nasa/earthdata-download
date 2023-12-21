exports.up = (knex) => knex.schema.table('preferences', (table) => {
  table.boolean('allowMetrics').defaultTo(false)
  table.boolean('hasMetricsPreferenceBeenSet').defaultTo(false)
})

exports.down = (knex) => knex.schema.table('preferences', (table) => {
  table.dropColumn('allowMetrics')
  table.dropColumn('hasMetricsPreferenceBeenSet')
})
