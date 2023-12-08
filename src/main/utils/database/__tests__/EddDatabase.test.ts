// @ts-nocheck

import knex from 'knex'
import mockDb from 'mock-knex'
import MockDate from 'mockdate'

import EddDatabase from '../EddDatabase'
import * as getDatabaseConnection from '../getDatabaseConnection'

import downloadStates from '../../../../app/constants/downloadStates'

let mockDbConnection
let dbTracker

beforeEach(() => {
  jest.clearAllMocks()

  jest.spyOn(getDatabaseConnection, 'getDatabaseConnection').mockImplementationOnce(() => {
    mockDbConnection = knex({
      client: 'sqlite',
      useNullAsDefault: true,
      migrations: {}
    })

    mockDb.mock(mockDbConnection)

    return mockDbConnection
  })

  dbTracker = mockDb.getTracker()
  dbTracker.install()

  MockDate.set('2023-05-01')
})

afterEach(() => {
  dbTracker.uninstall()
})

describe('EddDatabase', () => {
  // These tests were terrible, if more migrations are written they will need to be listed here.
  // But if anything else breaks in the future, just get rid of the test, its not worth figuring out again.
  describe('migrateDatabase', () => {
    test('runs the migrations and seeds', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1 || step === 2 || step === 7 || step === 8) {
          // `knex_migrations`, `knex_migrations_lock`
          query.response([{ type: 'table' }])
        } else if (step === 3 || step === 9) {
          // Query: select * from `knex_migrations_lock`
          query.response([{
            index: 1,
            isLocked: 0
          }])
        } else if (step === 4 || step === 10) {
          // Query: select `name` from `knex_migrations` order by `id` asc'
          query.response([{
            name: '20230613175153_create_preferences.js'
          }, {
            name: '20230613195457_create_downloads.js'
          }, {
            name: '20230613195511_create_files.js'
          }, {
            name: '20230616233921_create_token.js'
          }, {
            name: '20230706005138_add_getLinks_token_to_downloads.js'
          },
          {
            name: '20230717153820_add_byte_columns_to_files_table.js'
          }, {
            name: '20230724200528_add_eulaUrl_to_downloads.js'
          }, {
            name: '20230818181842_change_files_url_type.js'
          }, {
            name: '20230829164244_create_file_pauses.js'
          }, {
            name: '20230905170945_add_active_to_downloads.js'
          }, {
            name: '20230915000245_add_delete_id_to_downloads.js'
          }, {
            name: '20230915000521_add_delete_id_to_files.js'
          }, {
            name: '20230915000535_add_delete_id_to_pauses.js'
          }, {
            name: '20230915190921_add_restart_id_to_downloads.js'
          }, {
            name: '20230915190942_add_restart_id_to_files.js'
          }, {
            name: '20230916000143_add_cancel_id_to_downloads.js'
          }, {
            name: '20230916000205_add_cancel_id_to_files.js'
          }, {
            name: '20230916012751_add_clear_id_to_downloads.js'
          }])
        } else if (step === 5) {
          // Query: select `name` from `knex_migrations` order by `id` asc'
          query.response()
        } else if (step === 6 || step === 12) {
          // Query: update `knex_migrations_lock` set `is_locked` = ?'
          query.response(1)
        } else if (step === 11) {
          // Query: select max(`batch`) as `max_batch` from `knex_migrations`
          query.response([{ 'max(`batch`)': 1 }])
        } else if (step === 7 || step === 13) {
          // 7 - BEGIN
          // 13 - COMMIT
          query.response()
        } else if (step === 14) {
          // Running the seed, inserting preferences
          expect(query.sql).toEqual('insert into `preferences` (`concurrentDownloads`, `id`) values (?, ?) on conflict do nothing')
          expect(query.bindings).toEqual([5, 1])
          query.response([])
        } else if (step === 15) {
          // Running the seed, inserting token
          expect(query.sql).toEqual('insert into `token` (`id`, `token`) values (?, ?) on conflict do nothing')
          expect(query.bindings).toEqual([1, null])
          query.response([])
        } else {
          query.response()
        }
      })

      const database = new EddDatabase('./')

      await database.migrateDatabase()
    })
  })

  describe('getPreferences', () => {
    test('returns the preferences data', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `preferences` where `id` = ? limit ?')
        expect(query.bindings).toEqual([1, 1])

        query.response({
          concurrentDownloads: 5
        })
      })

      const database = new EddDatabase('./')

      const result = await database.getPreferences()

      expect(result).toEqual({ concurrentDownloads: 5 })
    })
  })

  describe('getPreferencesByField', () => {
    test('returns the preferences data', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `concurrentDownloads` from `preferences` where `id` = ? limit ?')
        expect(query.bindings).toEqual([1, 1])

        query.response({
          concurrentDownloads: 5
        })
      })

      const database = new EddDatabase('./')

      const result = await database.getPreferencesByField('concurrentDownloads')

      expect(result).toEqual(5)
    })
  })

  describe('setPreferences', () => {
    test('sets the preferences data', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `preferences` set `lastDownloadLocation` = ? where `id` = ?')
        expect(query.bindings).toEqual(['/mock/downloads', 1])

        query.response({
          concurrentDownloads: 5,
          lastDownloadLocation: '/mock/downloads'
        })
      })

      const database = new EddDatabase('./')

      const result = await database.setPreferences({
        lastDownloadLocation: '/mock/downloads'
      })

      expect(result).toEqual({
        concurrentDownloads: 5,
        lastDownloadLocation: '/mock/downloads'
      })
    })
  })

  describe('getToken', () => {
    test('returns the token data', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `token` where `id` = ? limit ?')
        expect(query.bindings).toEqual([1, 1])

        query.response('mock-token')
      })

      const database = new EddDatabase('./')

      const result = await database.getToken()

      expect(result).toEqual('mock-token')
    })
  })

  describe('setToken', () => {
    test('sets the token data', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `token` set `token` = ? where `id` = ?')
        expect(query.bindings).toEqual(['mock-token', 1])

        query.response({
          id: 1,
          token: 'mock-token'
        })
      })

      const database = new EddDatabase('./')

      const result = await database.setToken('mock-token')

      expect(result).toEqual({
        id: 1,
        token: 'mock-token'
      })
    })
  })

  describe('getAllDownloads', () => {
    test('returns all downloads', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `downloads` order by `createdAt` desc')
        expect(query.bindings).toEqual([])

        query.response([{
          id: 'mock-download-1'
        }, {
          id: 'mock-download-2'
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getAllDownloads()

      expect(result).toEqual([{
        id: 'mock-download-1'
      }, {
        id: 'mock-download-2'
      }])
    })
  })

  describe('getAllDownloadsWhere', () => {
    test('returns all downloads', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `downloads` where `active` = ? order by `createdAt` desc')
        expect(query.bindings).toEqual([true])

        query.response([{
          id: 'mock-download-1'
        }, {
          id: 'mock-download-2'
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getAllDownloadsWhere({ active: true })

      expect(result).toEqual([{
        id: 'mock-download-1'
      }, {
        id: 'mock-download-2'
      }])
    })
  })

  describe('getDownloadById', () => {
    test('returns requested download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `downloads` where `id` = ? limit ?')
        expect(query.bindings).toEqual(['mock-download-1', 1])

        query.response({
          id: 'mock-download-1'
        })
      })

      const database = new EddDatabase('./')

      const result = await database.getDownloadById('mock-download-1')

      expect(result).toEqual({
        id: 'mock-download-1'
      })
    })
  })

  describe('getDownloadsWhere', () => {
    test('returns requested download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `id`, `getLinksToken`, `getLinksUrl` from `downloads` where `state` = ?')
        expect(query.bindings).toEqual([downloadStates.pending])

        query.response({
          id: 'mock-download-1'
        })
      })

      const database = new EddDatabase('./')

      const result = await database.getDownloadsWhere({
        state: downloadStates.pending
      })

      expect(result).toEqual({
        id: 'mock-download-1'
      })
    })
  })

  describe('clearDownload', () => {
    describe('when a downloadId is provided', () => {
      test('sets the download to inactive', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('update `downloads` set `active` = ?, `clearId` = ? where `id` = ?')
          expect(query.bindings).toEqual([
            false,
            'mock-clear-id',
            'mock-download-id'
          ])

          query.response([1])
        })

        const database = new EddDatabase('./')

        await database.clearDownload('mock-download-id', 'mock-clear-id')
      })
    })

    describe('when a downloadId is not provided', () => {
      test('sets all downloads to inactive', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('update `downloads` set `active` = ?, `clearId` = ? where `active` = ?')
          expect(query.bindings).toEqual([
            false,
            'mock-clear-id',
            true
          ])

          query.response([1])
        })

        const database = new EddDatabase('./')

        await database.clearDownload(undefined, 'mock-clear-id')
      })
    })
  })

  describe('createDownload', () => {
    test('creates a new download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('insert into `downloads` (`active`, `id`, `loadingMoreFiles`, `state`) values (?, ?, ?, ?)')
        expect(query.bindings).toEqual([
          true,
          'mock-download-1',
          true,
          downloadStates.pending
        ])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.createDownload('mock-download-1', {
        loadingMoreFiles: true,
        state: downloadStates.pending
      })
    })
  })

  describe('updateDownloadById', () => {
    test('updates the requested download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `downloads` set `loadingMoreFiles` = ?, `state` = ? where `id` = ?')
        expect(query.bindings).toEqual([false, downloadStates.active, 'mock-download-1'])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.updateDownloadById('mock-download-1', {
        loadingMoreFiles: false,
        state: downloadStates.active
      })
    })
  })

  describe('updateDownloadsWhere', () => {
    test('updates the requested downloads', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `downloads` set `loadingMoreFiles` = ?, `state` = ? where `active` = ?')
        expect(query.bindings).toEqual([
          false,
          downloadStates.active,
          true
        ])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.updateDownloadsWhere({
        active: true
      }, {
        loadingMoreFiles: false,
        state: downloadStates.active
      })
    })
  })

  describe('updateDownloadsWhereIn', () => {
    test('updates the requested downloads', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `downloads` set `state` = ? where `state` in (?, ?) returning `id`')
        expect(query.bindings).toEqual([
          downloadStates.paused,
          downloadStates.active,
          downloadStates.pending
        ])

        query.response([{ id: 42 }])
      })

      const database = new EddDatabase('./')

      const result = await database.updateDownloadsWhereIn([
        'state',
        [downloadStates.active, downloadStates.pending]
      ], {
        state: downloadStates.paused
      })

      expect(result).toEqual([{ id: 42 }])
    })
  })

  describe('deleteDownloadById', () => {
    test('deletes the requested downloads and those download\'s files', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1) {
          expect(query.sql).toEqual('delete from `files` where `downloadId` = ?')
          expect(query.bindings).toEqual(['mock-download-1'])
        }

        if (step === 2) {
          expect(query.sql).toEqual('delete from `downloads` where `id` = ?')
          expect(query.bindings).toEqual(['mock-download-1'])
        }

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.deleteDownloadById('mock-download-1')
    })
  })

  describe('deleteAllDownloads', () => {
    test('deletes all files and downloads', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1) {
          expect(query.sql).toEqual('delete from `files`')
          expect(query.bindings).toEqual([])
        }

        if (step === 2) {
          expect(query.sql).toEqual('delete from `pauses`')
          expect(query.bindings).toEqual([])
        }

        if (step === 3) {
          expect(query.sql).toEqual('delete from `downloads`')
          expect(query.bindings).toEqual([])
        }

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.deleteAllDownloads()
    })
  })

  describe('getFileWhere', () => {
    test('returns requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `files` where `filename` = ? and `downloadId` = ? limit ?')
        expect(query.bindings).toEqual([
          'example.png',
          'mock-download-1',
          1
        ])

        query.response({
          id: 'mock-download-1'
        })
      })

      const database = new EddDatabase('./')

      const result = await database.getFileWhere({
        filename: 'example.png',
        downloadId: 'mock-download-1'
      })

      expect(result).toEqual({
        id: 'mock-download-1'
      })
    })
  })

  describe('getFilesWhere', () => {
    test('returns requested files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `files` where `downloadId` = ? order by `createdAt` asc')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response([{
          id: 'mock-file-1'
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesWhere({
        downloadId: 'mock-download-1'
      })

      expect(result).toEqual([{
        id: 'mock-file-1'
      }])
    })
  })

  describe('getErroredFiles', () => {
    test('returns requested files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `downloads`.`active`, `files`.`downloadId`, count(`files`.`id`) as `numberErrors` from `files` inner join `downloads` on `files`.`downloadId` = `downloads`.`id` where `files`.`state` = ? and `files`.`deleteId` is null group by `files`.`downloadId`')
        expect(query.bindings).toEqual([
          downloadStates.error
        ])

        query.response([{
          downloadId: 'mock-download-id-2',
          numberErrors: 1
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getErroredFiles('mock-download-1')

      expect(result).toEqual([{
        downloadId: 'mock-download-id-2',
        numberErrors: 1
      }])
    })
  })

  describe('getFilesToStart', () => {
    test('returns requested files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `files`.* from `files` inner join `downloads` on `files`.`downloadId` = `downloads`.`id` where `files`.`state` = ? and `downloads`.`state` = ? order by `files`.`createdAt` asc limit ?')
        expect(query.bindings).toEqual([
          downloadStates.pending,
          downloadStates.active,
          2
        ])

        query.response([{
          id: 123
        }, {
          id: 456
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesToStart(2)

      expect(result).toEqual([{
        id: 123
      }, {
        id: 456
      }])
    })

    test('returns requested files when a fileId is provided', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `files`.* from `files` inner join `downloads` on `files`.`downloadId` = `downloads`.`id` where `files`.`state` = ? and `downloads`.`state` = ? or (`files`.`id` = ?) order by `files`.`createdAt` asc limit ?')
        expect(query.bindings).toEqual([
          downloadStates.pending,
          downloadStates.active,
          123,
          2
        ])

        query.response([{
          id: 123
        }, {
          id: 456
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesToStart(2, 123)

      expect(result).toEqual([{
        id: 123
      }, {
        id: 456
      }])
    })
  })

  describe('getFileCountWhere', () => {
    test('returns requested files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select count(`id`) from `files` where `downloadId` = ?')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response([
          { 'count(`id`)': 5 }
        ])
      })

      const database = new EddDatabase('./')

      const result = await database.getFileCountWhere({
        downloadId: 'mock-download-1'
      })

      expect(result).toEqual(5)
    })
  })

  describe('getNotCompletedFilesCountByDownloadId', () => {
    test('returns requested file count', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select count(`id`) from `files` where `downloadId` = ? and `state` not in (?, ?, ?)')
        expect(query.bindings).toEqual([
          'mock-download-1',
          downloadStates.completed,
          downloadStates.cancelled,
          downloadStates.error
        ])

        query.response([
          { 'count(`id`)': 5 }
        ])
      })

      const database = new EddDatabase('./')

      const result = await database.getNotCompletedFilesCountByDownloadId('mock-download-1')

      expect(result).toEqual(5)
    })
  })

  describe('getActiveFilesCountByDownloadId', () => {
    test('returns requested file count', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select count(`id`) from `files` where `downloadId` = ? and `state` = ?')
        expect(query.bindings).toEqual([
          'mock-download-1',
          downloadStates.active
        ])

        query.response([
          { 'count(`id`)': 5 }
        ])
      })

      const database = new EddDatabase('./')

      const result = await database.getActiveFilesCountByDownloadId('mock-download-1')

      expect(result).toEqual(5)
    })
  })

  describe('updateFile', () => {
    test('updates the requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `files` set `state` = ? where `id` = ?')
        expect(query.bindings).toEqual([downloadStates.active, 'mock-file-1'])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.updateFileById('mock-file-1', {
        state: downloadStates.active
      })
    })
  })

  describe('updateFilesWhere', () => {
    test('updates the requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `files` set `state` = ? where `state` = ? returning `id`, `downloadId`, `filename`')
        expect(query.bindings).toEqual([
          downloadStates.pending,
          downloadStates.error
        ])

        query.response([{
          id: 123,
          downloadId: 42,
          filename: 'mock-filename'
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.updateFilesWhere({
        state: downloadStates.error
      }, {
        state: downloadStates.pending
      })

      expect(result).toEqual([{
        id: 123,
        downloadId: 42,
        filename: 'mock-filename'
      }])
    })
  })

  describe('createPauseByDownloadIdAndFilename', () => {
    test('creates new pauses', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1) {
          expect(query.sql).toEqual('select `id` from `files` where `downloadId` = ? and `filename` = ? limit ?')
          expect(query.bindings).toEqual([
            'mock-download-id',
            'mock-filename',
            1
          ])

          query.response({ id: 42 })
        }

        if (step === 2) {
          expect(query.sql).toEqual('insert into `pauses` (`downloadId`, `fileID`, `timeStart`) values (?, ?, ?)')
          expect(query.bindings).toEqual([
            'mock-download-id',
            42,
            1682899200000
          ])

          query.response([1])
        }
      })

      const database = new EddDatabase('./')

      await database.createPauseByDownloadIdAndFilename('mock-download-id', 'mock-filename')
    })
  })

  describe('createPauseByDownloadId', () => {
    describe('when pauseFiles is true', () => {
      test('creates new pauses', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('select `id` from `files` where `downloadId` = ? and `state` = ?')
            expect(query.bindings).toEqual([
              'mock-download-id',
              downloadStates.active
            ])

            query.response([
              { id: 42 },
              { id: 43 }
            ])
          }

          if (step === 2) {
            expect(query.sql).toEqual('select `id` from `pauses` where `downloadId` = ? and `fileId` is null and `timeEnd` is null')
            expect(query.bindings).toEqual(['mock-download-id'])

            query.response([1])
          }

          if (step === 3) {
            expect(query.sql).toEqual('insert into `pauses` (`downloadId`, `fileId`, `timeStart`) select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart`')
            expect(query.bindings).toEqual([
              'mock-download-id',
              42,
              1682899200000,
              'mock-download-id',
              43,
              1682899200000
            ])

            query.response([1])
          }
        })

        const database = new EddDatabase('./')

        await database.createPauseByDownloadId('mock-download-id', true)
      })
    })

    describe('when pauseFiles is false', () => {
      test('creates new pauses', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('select `id` from `pauses` where `downloadId` = ? and `fileId` is null and `timeEnd` is null')
            expect(query.bindings).toEqual(['mock-download-id'])

            query.response([1])
          }

          if (step === 2) {
            expect(query.sql).toEqual('insert into `pauses` (`downloadId`, `fileId`, `timeStart`) select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart`')
            expect(query.bindings).toEqual([
              'mock-download-id',
              42,
              1682899200000,
              'mock-download-id',
              43,
              1682899200000
            ])

            query.response([1])
          }
        })

        const database = new EddDatabase('./')

        await database.createPauseByDownloadId('mock-download-id', false)
      })
    })

    describe('when the download has already paused', () => {
      test('creates new pauses', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('select `id` from `files` where `downloadId` = ? and `state` = ?')
            expect(query.bindings).toEqual([
              'mock-download-id',
              downloadStates.active
            ])

            query.response([
              { id: 42 },
              { id: 43 }
            ])
          }

          if (step === 2) {
            expect(query.sql).toEqual('select `id` from `pauses` where `downloadId` = ? and `fileId` is null and `timeEnd` is null')
            expect(query.bindings).toEqual(['mock-download-id'])

            query.response([])
          }

          if (step === 3) {
            expect(query.sql).toEqual('insert into `pauses` (`downloadId`, `fileId`, `timeStart`) select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart`')
            expect(query.bindings).toEqual([
              'mock-download-id',
              42,
              1682899200000,
              'mock-download-id',
              43,
              1682899200000,
              'mock-download-id',
              undefined,
              1682899200000
            ])

            query.response([1])
          }
        })

        const database = new EddDatabase('./')

        await database.createPauseByDownloadId('mock-download-id', true)
      })
    })
  })

  describe('createPauseForAllActiveDownloads', () => {
    describe('when there are no active downloads', () => {
      test('does not create new pauses', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('select `id`, `downloadId` from `files` where `state` = ?')
            expect(query.bindings).toEqual([
              downloadStates.active
            ])

            query.response([])
          }

          if (step === 2) {
            expect(query.sql).toEqual('select `id` from `downloads` where `state` = ?')
            expect(query.bindings).toEqual([
              downloadStates.active
            ])

            query.response([])
          }
        })

        const database = new EddDatabase('./')

        const result = await database.createPauseForAllActiveDownloads()

        expect(result).toEqual({
          pausedIds: []
        })
      })
    })

    describe('when there are active downloads', () => {
      test('creates new pauses', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('select `id`, `downloadId` from `files` where `state` = ?')
            expect(query.bindings).toEqual([
              downloadStates.active
            ])

            query.response([
              {
                id: 42,
                downloadId: 'mock-download-id1'
              },
              {
                id: 43,
                downloadId: 'mock-download-id2'
              }
            ])
          }

          if (step === 2) {
            expect(query.sql).toEqual('select `id` from `downloads` where `state` = ?')
            expect(query.bindings).toEqual([
              downloadStates.active
            ])

            query.response([
              {
                id: 'mock-download-id1'
              },
              {
                id: 'mock-download-id2'
              }
            ])
          }

          if (step === 3) {
            expect(query.sql).toEqual('insert into `pauses` (`downloadId`, `fileId`, `timeStart`) select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart` union all select ? as `downloadId`, ? as `fileId`, ? as `timeStart`')
            expect(query.bindings).toEqual([
              'mock-download-id1',
              42,
              1682899200000,
              'mock-download-id2',
              43,
              1682899200000,
              'mock-download-id1',
              undefined,
              1682899200000,
              'mock-download-id2',
              undefined,
              1682899200000
            ])

            query.response([1])
          }
        })

        const database = new EddDatabase('./')

        await database.createPauseForAllActiveDownloads()
      })
    })
  })

  describe('createPauseWith', () => {
    test('deletes pause rows', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('insert into `pauses` (`downloadId`, `timeEnd`, `timeStart`) values (?, ?, ?)')
        expect(query.bindings).toEqual([
          'mock-download-id',
          456,
          123
        ])

        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.createPauseWith({
        downloadId: 'mock-download-id',
        timeEnd: 456,
        timeStart: 123
      })
    })
  })

  describe('endPause', () => {
    describe('when downloadId and filename are provided', () => {
      test('ends the pauses', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('update `pauses` set `timeEnd` = ? where `downloadId` = ? and `timeEnd` is null and `fileID` = SELECT id FROM files WHERE downloadId = mock-download-id AND filename = mock-filename;')
          expect(query.bindings).toEqual([
            1682899200000,
            'mock-download-id'
          ])

          query.response([1])
        })

        const database = new EddDatabase('./')

        await database.endPause('mock-download-id', 'mock-filename')
      })
    })

    describe('when only downloadId is provided', () => {
      test('ends the pauses', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('update `pauses` set `timeEnd` = ? where `downloadId` = ? and `timeEnd` is null')
          expect(query.bindings).toEqual([
            1682899200000,
            'mock-download-id'
          ])

          query.response([1])
        })

        const database = new EddDatabase('./')

        await database.endPause('mock-download-id')
      })
    })
  })

  describe('getPausesSum', () => {
    test('returns the sum of the pause rows', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select sum(IFNULL(`pauses`.`timeEnd`, UNIXEPOCH() * 1000.0) - `pauses`.`timeStart`) as `pausesSum` from `pauses` where `downloadId` = ? and `fileId` is null limit ?')
        expect(query.bindings).toEqual([
          'mock-download-id',
          1
        ])

        query.response({ pausesSum: 42 })
      })

      const database = new EddDatabase('./')

      const result = await database.getPausesSum('mock-download-id')

      expect(result).toEqual(42)
    })
  })

  describe('deletePausesByDownloadIdAndFilename', () => {
    test('deletes pause rows', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1) {
          expect(query.sql).toEqual('select `id` from `files` where `downloadId` = ? and `filename` = ? limit ?')
          expect(query.bindings).toEqual([
            'mock-download-id',
            'mock-filename',
            1
          ])

          query.response({ id: 42 })
        }

        if (step === 2) {
          expect(query.sql).toEqual('delete from `pauses` where `downloadId` = ? and `fileId` = ?')
          expect(query.bindings).toEqual([
            'mock-download-id',
            42
          ])

          query.response([1])
        }
      })

      const database = new EddDatabase('./')

      await database.deletePausesByDownloadIdAndFilename('mock-download-id', 'mock-filename')
    })
  })

  describe('deleteAllPausesByDownloadId', () => {
    test('deletes pause rows', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('delete from `pauses` where `downloadId` = ?')
        expect(query.bindings).toEqual([
          'mock-download-id'
        ])

        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.deleteAllPausesByDownloadId('mock-download-id')
    })
  })

  describe('deleteFilePausesByDownloadId', () => {
    test('deletes pause rows', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('delete from `pauses` where `downloadId` = ? and `fileId` is not null')
        expect(query.bindings).toEqual([
          'mock-download-id'
        ])

        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.deleteFilePausesByDownloadId('mock-download-id')
    })
  })

  describe('updateDownloadsWhereAndWhereNotIn', () => {
    test('updates the requested file where and where not condition', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `downloads` set `state` = ?, `timeEnd` = ? where `active` = ? and `state` not in (?, ?) returning `id`')
        expect(query.bindings).toEqual([
          downloadStates.cancelled,
          1682899200000,
          true,
          downloadStates.completed,
          downloadStates.cancelled
        ])

        query.response([{ id: 42 }])
      })

      const database = new EddDatabase('./')

      const result = await database.updateDownloadsWhereAndWhereNotIn(
        { active: true },
        [
          'state',
          [downloadStates.completed, downloadStates.cancelled]
        ],
        {
          state: downloadStates.cancelled,
          timeEnd: new Date().getTime()
        }
      )

      expect(result).toEqual([{ id: 42 }])
    })
  })

  describe('updateFilesWhereAndWhereNot', () => {
    test('updates the requested file where and where not condition', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `files` set `state` = ? where `downloadId` = ? and not `state` = ? returning `id`, `downloadId`')
        expect(query.bindings).toEqual([
          downloadStates.cancelled,
          'mock-download-1',
          downloadStates.completed
        ])

        query.response([{
          id: 42,
          downloadId: 123
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.updateFilesWhereAndWhereNot(
        { downloadId: 'mock-download-1' },
        { state: downloadStates.completed },
        { state: downloadStates.cancelled }
      )

      expect(result).toEqual([{
        id: 42,
        downloadId: 123
      }])
    })
  })

  describe('addLinksByDownloadId', () => {
    test('add links to the download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('insert into `files` (`createdAt`, `downloadId`, `filename`, `percent`, `state`, `url`) select ? as `createdAt`, ? as `downloadId`, ? as `filename`, ? as `percent`, ? as `state`, ? as `url` union all select ? as `createdAt`, ? as `downloadId`, ? as `filename`, ? as `percent`, ? as `state`, ? as `url` union all select ? as `createdAt`, ? as `downloadId`, ? as `filename`, ? as `percent`, ? as `state`, ? as `url`')
        expect(query.bindings).toEqual([
          1682899200000,
          'mock-download-1',
          'file1.png',
          0,
          downloadStates.pending,
          'http://example.com/file1.png',
          1682899200000,
          'mock-download-1',
          'file2.png',
          0,
          downloadStates.pending,
          'http://example.com/file2.png',
          1682899200000,
          'mock-download-1',
          'file3.png',
          0,
          downloadStates.pending,
          'http://example.com/file3.png'
        ])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.addLinksByDownloadId('mock-download-1', [
        'http://example.com/file1.png',
        'http://example.com/file2.png',
        'http://example.com/file3.png'
      ])
    })
  })

  describe('getDownloadReport', () => {
    test('returns the report', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select sum(`percent`) as `percentSum`, count(`id`) as `totalFiles`, count(CASE `state` WHEN \'COMPLETED\' THEN 1 ELSE NULL END) as `finishedFiles` from `files` where `downloadId` = ? and `deleteId` is null')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response([{
          percentSum: 42,
          totalFiles: 10,
          finishedFiles: 0
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getDownloadReport('mock-download-1')

      expect(result).toEqual({
        percentSum: 42,
        totalFiles: 10,
        finishedFiles: 0
      })
    })
  })

  describe('getFilesReport', () => {
    test('returns the report', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `files`.`cancelId`, `files`.`downloadId`, `files`.`filename`, `files`.`percent`, `files`.`receivedBytes`, `files`.`restartId`, `files`.`state`, `files`.`totalBytes`, (((IFNULL(`files`.`timeEnd`, UNIXEPOCH () * 1000.0) - `files`.`timeStart`) - IFNULL(sum(IFNULL(`pauses`.`timeEnd`, UNIXEPOCH () * 1000.0) - `pauses`.`timeStart`), 0)) / receivedBytes * (totalBytes - receivedBytes)) AS remainingTime from `files` full outer join `pauses` on `files`.`id` = `pauses`.`fileId` where `files`.`downloadId` = ? group by `files`.`id` order by `createdAt` asc limit ?')
        expect(query.bindings).toEqual([
          'mock-download-1',
          2
        ])

        query.response([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.active,
          percent: 42,
          receivedBytes: 518,
          totalBytes: 1234,
          remainingTime: 5678
        }, {
          downloadId: 'mock-download-id',
          filename: 'file2.png',
          state: downloadStates.active,
          percent: 32,
          receivedBytes: 400,
          totalBytes: 1234,
          remainingTime: 6789
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesReport({
        downloadId: 'mock-download-1',
        hideCompleted: false,
        limit: 2,
        offset: 0
      })

      expect(result).toEqual([{
        downloadId: 'mock-download-id',
        filename: 'file1.png',
        state: downloadStates.active,
        percent: 42,
        receivedBytes: 518,
        totalBytes: 1234,
        remainingTime: 5678
      }, {
        downloadId: 'mock-download-id',
        filename: 'file2.png',
        state: downloadStates.active,
        percent: 32,
        receivedBytes: 400,
        totalBytes: 1234,
        remainingTime: 6789
      }])
    })

    test('returns the report when hiding completed files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `files`.`cancelId`, `files`.`downloadId`, `files`.`filename`, `files`.`percent`, `files`.`receivedBytes`, `files`.`restartId`, `files`.`state`, `files`.`totalBytes`, (((IFNULL(`files`.`timeEnd`, UNIXEPOCH () * 1000.0) - `files`.`timeStart`) - IFNULL(sum(IFNULL(`pauses`.`timeEnd`, UNIXEPOCH () * 1000.0) - `pauses`.`timeStart`), 0)) / receivedBytes * (totalBytes - receivedBytes)) AS remainingTime from `files` full outer join `pauses` on `files`.`id` = `pauses`.`fileId` where `files`.`downloadId` = ? and not `state` = ? group by `files`.`id` order by `createdAt` asc limit ?')
        expect(query.bindings).toEqual([
          'mock-download-1',
          downloadStates.completed,
          2
        ])

        query.response([{
          downloadId: 'mock-download-id',
          filename: 'file1.png',
          state: downloadStates.active,
          percent: 42,
          receivedBytes: 518,
          totalBytes: 1234,
          remainingTime: 5678
        }, {
          downloadId: 'mock-download-id',
          filename: 'file2.png',
          state: downloadStates.active,
          percent: 32,
          receivedBytes: 400,
          totalBytes: 1234,
          remainingTime: 6789
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesReport({
        downloadId: 'mock-download-1',
        hideCompleted: true,
        limit: 2,
        offset: 0
      })

      expect(result).toEqual([{
        downloadId: 'mock-download-id',
        filename: 'file1.png',
        state: downloadStates.active,
        percent: 42,
        receivedBytes: 518,
        totalBytes: 1234,
        remainingTime: 5678
      }, {
        downloadId: 'mock-download-id',
        filename: 'file2.png',
        state: downloadStates.active,
        percent: 32,
        receivedBytes: 400,
        totalBytes: 1234,
        remainingTime: 6789
      }])
    })
  })

  describe('getTotalFilesPerFilesReport', () => {
    test('returns the report', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select count(`id`) from `files` where `downloadId` = ?')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response([{ 'count(`id`)': 42 }])
      })

      const database = new EddDatabase('./')

      const result = await database.getTotalFilesPerFilesReport({
        downloadId: 'mock-download-1',
        hideCompleted: false
      })

      expect(result).toEqual(42)
    })

    test('returns the report when hiding completed files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select count(`id`) from `files` where `downloadId` = ? and not `state` = ?')
        expect(query.bindings).toEqual([
          'mock-download-1',
          downloadStates.completed
        ])

        query.response([{ 'count(`id`)': 42 }])
      })

      const database = new EddDatabase('./')

      const result = await database.getTotalFilesPerFilesReport({
        downloadId: 'mock-download-1',
        hideCompleted: true
      })

      expect(result).toEqual(42)
    })
  })

  describe('getFilesHeaderReport', () => {
    test('returns the report', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select `downloads`.`cancelId`, `downloads`.`id`, `downloads`.`downloadLocation`, `downloads`.`loadingMoreFiles`, `downloads`.`state`, (IFNULL(`downloads`.`timeEnd`, UNIXEPOCH() * 1000.0) - `downloads`.`timeStart`) as totalTime, sum(`files`.`percent`) as `percentSum`, sum(`files`.`receivedBytes`) as `receivedBytesSum`, sum(`files`.`totalBytes`) as `totalBytesSum`, count(`files`.`id`) as `totalFiles`, count(CASE WHEN `percent` > 0 THEN 1 ELSE NULL END) as `filesWithProgress`, count(CASE `files`.`state` WHEN \'COMPLETED\' THEN 1 ELSE NULL END) as `finishedFiles` from `files` inner join `downloads` on `files`.`downloadId` = `downloads`.`id` where `files`.`downloadId` = ?')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response([{
          id: 'mock-download-id',
          downloadLocation: '/mock/downloads/path',
          state: downloadStates.active,
          totalTime: 123,
          percentSum: 50,
          receivedBytesSum: 50000,
          totalBytesSum: 100000,
          totalFiles: 100,
          filesWithProgress: 5,
          finishedFiles: 50
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesHeaderReport('mock-download-1')

      expect(result).toEqual({
        id: 'mock-download-id',
        downloadLocation: '/mock/downloads/path',
        state: downloadStates.active,
        totalTime: 123,
        percentSum: 50,
        receivedBytesSum: 50000,
        totalBytesSum: 100000,
        totalFiles: 100,
        filesWithProgress: 5,
        finishedFiles: 50
      })
    })
  })

  describe('getDownloadsReport', () => {
    describe('when active is true', () => {
      test('returns the report', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('select `downloads`.`cancelId`, `downloads`.`id`, `downloads`.`loadingMoreFiles`, `downloads`.`restartId`, `downloads`.`state`, `downloads`.`timeStart`, (IFNULL(`downloads`.`timeEnd`, UNIXEPOCH() * 1000.0) - `downloads`.`timeStart`) as totalTime from `downloads` where `active` = ? and `deleteId` is null or `restartId` is not null order by `createdAt` desc limit ? offset ?')
          expect(query.bindings).toEqual([
            true,
            10,
            10
          ])

          query.response([
            {
              id: 'mock-download-id-1',
              loadingMoreFiles: 1,
              state: downloadStates.active,
              timeStart: 1234567,
              totalTime: 123
            },
            {
              id: 'mock-download-id-2',
              loadingMoreFiles: 0,
              state: downloadStates.active,
              timeStart: 1234567,
              totalTime: 456
            }
          ])
        })

        const database = new EddDatabase('./')

        const result = await database.getDownloadsReport(true, 10, 10)

        expect(result).toEqual([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            timeStart: 1234567,
            totalTime: 123
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            timeStart: 1234567,
            totalTime: 456
          }
        ])
      })
    })

    describe('when active is false', () => {
      test('returns the report', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('select `downloads`.`cancelId`, `downloads`.`id`, `downloads`.`loadingMoreFiles`, `downloads`.`restartId`, `downloads`.`state`, `downloads`.`timeStart`, (IFNULL(`downloads`.`timeEnd`, UNIXEPOCH() * 1000.0) - `downloads`.`timeStart`) as totalTime from `downloads` where `active` = ? and `deleteId` is null and `restartId` is null order by `createdAt` desc limit ? offset ?')
          expect(query.bindings).toEqual([
            false,
            10,
            10
          ])

          query.response([
            {
              id: 'mock-download-id-1',
              loadingMoreFiles: 1,
              state: downloadStates.active,
              timeStart: 1234567,
              totalTime: 123
            },
            {
              id: 'mock-download-id-2',
              loadingMoreFiles: 0,
              state: downloadStates.active,
              timeStart: 1234567,
              totalTime: 456
            }
          ])
        })

        const database = new EddDatabase('./')

        const result = await database.getDownloadsReport(false, 10, 10)

        expect(result).toEqual([
          {
            id: 'mock-download-id-1',
            loadingMoreFiles: 1,
            state: downloadStates.active,
            timeStart: 1234567,
            totalTime: 123
          },
          {
            id: 'mock-download-id-2',
            loadingMoreFiles: 0,
            state: downloadStates.active,
            timeStart: 1234567,
            totalTime: 456
          }
        ])
      })
    })
  })

  describe('getAllDownloadsCount', () => {
    describe('when active is true', () => {
      test('returns the report', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('select count(`id`) from `downloads` where `active` = ? and `deleteId` is null or `restartId` is not null')
          expect(query.bindings).toEqual([true])

          query.response([{
            'count(`id`)': 5
          }])
        })

        const database = new EddDatabase('./')

        const result = await database.getAllDownloadsCount(true)

        expect(result).toEqual(5)
      })
    })

    describe('when active is false', () => {
      test('returns the report', async () => {
        dbTracker.on('query', (query) => {
          expect(query.sql).toEqual('select count(`id`) from `downloads` where `active` = ? and `deleteId` is null and `restartId` is null')
          expect(query.bindings).toEqual([false])

          query.response([{
            'count(`id`)': 5
          }])
        })

        const database = new EddDatabase('./')

        const result = await database.getAllDownloadsCount(false)

        expect(result).toEqual(5)
      })
    })
  })

  describe('getFilesTotals', () => {
    test('returns the report', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select count(`files`.`id`) as `totalFiles`, count(CASE `files`.`state` WHEN \'COMPLETED\' THEN 1 ELSE NULL END) as `totalCompletedFiles` from `files` inner join `downloads` on `files`.`downloadId` = `downloads`.`id` where `downloads`.`active` = ? and `files`.`deleteId` is null')
        expect(query.bindings).toEqual([true])

        query.response([{
          totalCompletedFiles: 5,
          totalFiles: 14
        }])
      })

      const database = new EddDatabase('./')

      const result = await database.getFilesTotals()

      expect(result).toEqual({
        totalCompletedFiles: 5,
        totalFiles: 14
      })
    })
  })

  describe('addDeleteId', () => {
    describe('when a downloadId is provided', () => {
      test('adds the deleteId to pauses, files and downloads', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('update `downloads` set `deleteId` = ? where `id` = ?')
            expect(query.bindings).toEqual([
              'mock-delete-id',
              'mock-download-id'
            ])
          }

          if (step === 2) {
            expect(query.sql).toEqual('update `files` set `deleteId` = ? where `downloadId` = ?')
            expect(query.bindings).toEqual([
              'mock-delete-id',
              'mock-download-id'
            ])
          }

          if (step === 3) {
            expect(query.sql).toEqual('update `pauses` set `deleteId` = ? where `id` = ?')
            expect(query.bindings).toEqual([
              'mock-delete-id',
              'mock-download-id'
            ])
          }

          // We aren't returning anything from this method, the above assertions are the important part of the test
          query.response([1])
        })

        const database = new EddDatabase('./')

        await database.addDeleteId('mock-download-id', 'mock-delete-id')
      })
    })

    describe('when a downloadId is not provided', () => {
      test('adds the deleteId to pauses, files and downloads', async () => {
        dbTracker.on('query', (query, step) => {
          if (step === 1) {
            expect(query.sql).toEqual('update `pauses` set `deleteId` = ? where `downloadId` in (select `id` from `downloads` where `active` = ?)')
            expect(query.bindings).toEqual([
              'mock-delete-id',
              false
            ])

            query.response([1])
          }

          if (step === 2) {
            expect(query.sql).toEqual('update `files` set `deleteId` = ? where `downloadId` in (select `id` from `downloads` where `active` = ?)')
            expect(query.bindings).toEqual([
              'mock-delete-id',
              false
            ])

            query.response([1])
          }

          if (step === 3) {
            expect(query.sql).toEqual('update `downloads` set `deleteId` = ? where `downloads`.`active` = ?')
            expect(query.bindings).toEqual([
              'mock-delete-id',
              false
            ])

            query.response([1])
          }
        })

        const database = new EddDatabase('./')

        await database.addDeleteId(undefined, 'mock-delete-id')
      })
    })
  })

  describe('clearDeleteId', () => {
    test('removes the deleteId from pauses, files and downloads', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1) {
          expect(query.sql).toEqual('update `pauses` set `deleteId` = ? where `deleteId` = ?')
          expect(query.bindings).toEqual([
            null,
            'mock-delete-id'
          ])
        }

        if (step === 2) {
          expect(query.sql).toEqual('update `files` set `deleteId` = ? where `deleteId` = ?')
          expect(query.bindings).toEqual([
            null,
            'mock-delete-id'
          ])
        }

        if (step === 3) {
          expect(query.sql).toEqual('update `downloads` set `deleteId` = ? where `deleteId` = ?')
          expect(query.bindings).toEqual([
            null,
            'mock-delete-id'
          ])
        }

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.clearDeleteId('mock-delete-id')
    })
  })

  describe('deleteByDeleteId', () => {
    test('removes the deleteId from pauses, files and downloads', async () => {
      dbTracker.on('query', (query, step) => {
        if (step === 1) {
          expect(query.sql).toEqual('delete from `pauses` where `deleteId` = ?')
          expect(query.bindings).toEqual([
            'mock-delete-id'
          ])
        }

        if (step === 2) {
          expect(query.sql).toEqual('delete from `files` where `deleteId` = ?')
          expect(query.bindings).toEqual([
            'mock-delete-id'
          ])
        }

        if (step === 3) {
          expect(query.sql).toEqual('delete from `downloads` where `deleteId` = ?')
          expect(query.bindings).toEqual([
            'mock-delete-id'
          ])
        }

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })

      const database = new EddDatabase('./')

      await database.deleteByDeleteId('mock-delete-id')
    })
  })

  describe('getDownloadStatistics', () => {
    test('returns statistics for a completed download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual(expect.stringContaining('select count(`id`) as `fileCount'))
        expect(query.bindings).toEqual(['mock-download-id', 1])

        query.response({
          fileCount: 5,
          receivedBytesSum: 1000,
          totalBytesSum: 2000,
          totalDownloadTime: 5000,
          incompleteFileCount: 0,
          pauseCount: 2
        })
      })

      const database = new EddDatabase('./')

      const result = await database.getDownloadStatistics('mock-download-id')

      expect(result).toEqual({
        fileCount: 5,
        receivedBytesSum: 1000,
        totalBytesSum: 2000,
        totalDownloadTime: 5000,
        incompleteFileCount: 0,
        pauseCount: 2
      })
    })
  })
})
