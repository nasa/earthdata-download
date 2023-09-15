exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('restartId')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('restartId')
  })
