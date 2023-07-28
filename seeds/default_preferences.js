exports.seed = async (knex) => {
  // Inserts preferences if it doesn't exist
  await knex('preferences').insert([
    {
      id: 1,
      concurrentDownloads: 5
    }
  ]).onConflict().ignore()
}
