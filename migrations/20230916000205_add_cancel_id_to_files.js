exports.up = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.string('cancelId')
  })

exports.down = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.dropColumn('cancelId')
  })
