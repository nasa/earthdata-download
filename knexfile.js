module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      // This is only necessary to run `npx knex migrate:make`
      // Starting the application will then run the migrations on the real database
      // defined in getDatabaseConnection.ts
      filename: './tmp/dev.sqlite3'
    }
  }
}
