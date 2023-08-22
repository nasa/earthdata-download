exports.up = async (knex) => {
  await knex.schema.raw('ALTER TABLE files ADD COLUMN urlString VARCHAR(255);')
  await knex.schema.raw('UPDATE files SET urlString = CAST(url as VARCHAR(255));')
  await knex.schema.raw('ALTER TABLE files DROP COLUMN url;')
  await knex.schema.raw('ALTER TABLE files ADD COLUMN url TEXT;')
  await knex.schema.raw('UPDATE files SET url = CAST(urlString as TEXT);')

  return knex.schema.raw('ALTER TABLE files DROP COLUMN urlString;')
}

exports.down = async (knex) => {
  await knex.schema.raw('ALTER TABLE files ADD COLUMN urlText TEXT;')
  await knex.schema.raw('UPDATE files SET urlText = CAST(url as TEXT);')
  await knex.schema.raw('ALTER TABLE files DROP COLUMN url;')
  await knex.schema.raw('ALTER TABLE files ADD COLUMN url VARCHAR(255);')
  await knex.schema.raw('UPDATE files SET url = CAST(urlText as VARCHAR(255));')

  return knex.schema.raw('ALTER TABLE files DROP COLUMN urlText;')
}
