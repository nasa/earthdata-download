exports.up = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.string('deleteId')
  })

exports.down = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.dropColumn('deleteId')
  })
