exports.up = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.string('getLinksUrl')
    table.string('getLinksToken')
  })

exports.down = (knex) => knex.schema
  .alterTable('downloads', (table) => {
    table.dropColumn('getLinksUrl')
    table.dropColumn('getLinksToken')
  })
