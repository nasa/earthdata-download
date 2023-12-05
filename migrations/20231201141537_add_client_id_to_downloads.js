exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('clientId')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('clientId')
  })
