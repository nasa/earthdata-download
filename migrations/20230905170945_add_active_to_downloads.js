exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.boolean('active')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('active')
  })
