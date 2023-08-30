exports.up = (knex) => knex.schema
  .createTable('pauses', (table) => {
    table.increments('id')
    table.integer('downloadId')
    table.integer('fileId')
    table.timestamp('timeStart').notNullable()
    table.timestamp('timeEnd')
  })

exports.down = (knex) => knex.schema
  .dropTable('pauses')
