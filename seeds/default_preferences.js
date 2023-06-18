exports.seed = async function (knex) {
  // Inserts preferences if it doesn't exist
  await knex('preferences').insert([
    { id: 1, concurrentDownloads: 5 }
  ]).onConflict().ignore()
}
