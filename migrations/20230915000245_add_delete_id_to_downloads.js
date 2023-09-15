exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('deleteId')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('deleteId')
  })
