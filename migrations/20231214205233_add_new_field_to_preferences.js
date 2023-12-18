/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.table('preferences', (table) => {
  table.boolean('allowMetrics')
})

/**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
exports.down = (knex) => knex.schema.table('preferences', (table) => {
  table.dropColumn('allowMetrics')
})
