exports.up = (knex) => knex.schema
  .table('files', (table) => {
    table.integer('receivedBytes')
    table.integer('totalBytes')
  })

exports.down = (knex) => knex.schema
  .dropColumn('receivedBytes')
  .dropColumn('totalBytes')
