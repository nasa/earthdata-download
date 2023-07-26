exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('eulaUrl')
    table.string('eulaRedirectUrl')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('eulaUrl')
    table.dropColumn('eulaRedirectUrl')
  })
