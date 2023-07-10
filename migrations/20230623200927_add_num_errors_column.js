exports.up = (knex) => knex.schema
  .table('downloads', (table) => {
    table.integer('numErrors')
  })

exports.down = () => {}
