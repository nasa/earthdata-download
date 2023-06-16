exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('preferences').del()
  await knex('preferences').insert([
    { id: 1, concurrentDownloads: 5 }
  ])
}
