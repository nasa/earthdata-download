exports.up = function (knex) {
  return knex.schema
    .createTable('files', (table) => {
      table.increments('id')
      table.integer('downloadId')
      table.string('filename')
      table.string('state')
      table.string('url')
      table.integer('percent')
      table.timestamp('createdAt')
      table.timestamp('timeStart')
      table.timestamp('timeEnd')
      table.jsonb('errors')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('files')
}
