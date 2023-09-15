exports.up = (knex) => knex.schema
  .alterTable('pauses', (table) => {
    table.string('deleteId')
  })

exports.down = (knex) => knex.schema
  .alterTable('pauses', (table) => {
    table.dropColumn('deleteId')
  })
