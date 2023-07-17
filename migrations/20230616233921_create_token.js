exports.up = (knex) => knex.schema
  .createTable('token', (table) => {
    table.increments('id')
    table.string('token')
  })

exports.down = (knex) => knex.schema
  .dropTable('token')
