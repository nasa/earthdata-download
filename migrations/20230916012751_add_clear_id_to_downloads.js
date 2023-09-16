exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('clearId')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('clearId')
  })
