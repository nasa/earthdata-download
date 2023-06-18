exports.seed = async function (knex) {
  // Inserts token if it doesn't exist
  await knex('token').insert([
    { id: 1, token: null }
  ]).onConflict().ignore()
}
