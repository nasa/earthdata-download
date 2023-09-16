exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('cancelId')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('cancelId')
  })
