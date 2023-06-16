exports.up = function (knex) {
  return knex.schema
    .createTable('preferences', (table) => {
      table.increments('id')
      table.string('lastDownloadLocation', 255)
      table.string('defaultDownloadLocation', 255)
      table.integer('concurrentDownloads')
      table.jsonb('windowState')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('preferences')
}
