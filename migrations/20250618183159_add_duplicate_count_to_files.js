exports.up = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.integer('duplicateCount').defaultTo(0).notNullable()
  })

exports.down = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.dropColumn('duplicateCount')
  })
