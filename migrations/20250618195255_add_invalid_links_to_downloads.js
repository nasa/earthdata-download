exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.integer('invalidLinks').defaultTo(0).notNullable()
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('invalidLinks')
  })
