exports.up = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.string('restartId')
  })

exports.down = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.dropColumn('restartId')
  })
