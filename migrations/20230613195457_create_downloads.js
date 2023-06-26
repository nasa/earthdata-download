exports.up = (knex) => knex.schema
  .createTable('downloads', (table) => {
    table.string('id').primary().notNullable()
    table.string('state').notNullable()
    table.string('downloadLocation')
    table.string('authUrl')
    table.boolean('loadingMoreFiles')
    table.timestamp('createdAt')
    table.timestamp('timeStart')
    table.timestamp('timeEnd')
    table.jsonb('errors')
  })

exports.down = (knex) => knex.schema
  .dropTable('downloads')
