exports.up = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.unique(['downloadId', 'filename'])
  })

exports.down = (knex) => knex.schema
  .alterTable('files', (table) => {
    table.dropUnique(['downloadId', 'filename'])
  })
