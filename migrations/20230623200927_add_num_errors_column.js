exports.up = function (knex) {
  return knex.schema.table('downloads', (table) => {
    table.integer('numErrors')
  })
}

exports.down = function () {}
