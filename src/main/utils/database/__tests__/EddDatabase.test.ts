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
          // knex_migrations, knex_migrations_lock
          query.response([{ type: 'table' }])
        } else if (step === 3 || step === 9) {
          // select * from `knex_migrations_lock`
          query.response([{
            index: 1,
            isLocked: 0
          }])
        } else if (step === 4 || step === 10) {
          // select `name` from `knex_migrations` order by `id` asc'
          query.response([{
            name: '20230613175153_create_preferences.js'
          }, {
            name: '20230613195457_create_downloads.js'
          }, {
            name: '20230613195511_create_files.js'
          }, {
            name: '20230616233921_create_token.js'
          }])
        } else if (step === 5) {
          // select `name` from `knex_migrations` order by `id` asc'
          query.response()
        } else if (step === 6 || step === 12) {
          // update `knex_migrations_lock` set `is_locked` = ?'
          query.response(1)
        } else if (step === 11) {
          // select max(`batch`) as `max_batch` from `knex_migrations`
          query.response([{ 'max(`batch`)': 1 }])
        } else if (step === 7 || step === 13) {
          // 7 - BEGIN
          // 13 - COMMIT
          query.response()
        } else if (step === 14) {
          // running the seed, inserting preferences
          expect(query.sql).toEqual('insert into `preferences` (`concurrentDownloads`, `id`) values (?, ?) on conflict do nothing')
          expect(query.bindings).toEqual([5, 1])
          query.response([])
        } else if (step === 15) {
          // running the seed, inserting token
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

  describe('createDownload', () => {
    test('creates a new download', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('insert into `downloads` (`id`, `loadingMoreFiles`, `state`) values (?, ?, ?)')
        expect(query.bindings).toEqual(['mock-download-1', true, downloadStates.pending])

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

  describe('updateDownloadsWhereIn', () => {
    test('updates the requested downloads', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `downloads` set `state` = ? where `state` in (?, ?)')
        expect(query.bindings).toEqual([
          downloadStates.paused,
          downloadStates.active,
          downloadStates.pending
        ])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })
      const database = new EddDatabase('./')

      await database.updateDownloadsWhereIn([
        'state',
        [downloadStates.active, downloadStates.pending]
      ], {
        state: downloadStates.paused
      })
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

  describe('getFilesToStart', () => {
    test('returns requested files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `files` where `state` = ? order by `createdAt` asc limit ?')
        expect(query.bindings).toEqual([
          downloadStates.pending,
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
        expect(query.sql).toEqual('select * from `files` where `state` = ? or (`id` = ?) order by `createdAt` asc limit ?')
        expect(query.bindings).toEqual([
          downloadStates.pending,
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

  describe('getFilesWhere', () => {
    test('returns requested files', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select * from `files` where `downloadId` = ? order by `createdAt` asc')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response({
          id: 'mock-download-1'
        })
      })
      const database = new EddDatabase('./')

      const result = await database.getFilesWhere({
        downloadId: 'mock-download-1'
      })

      expect(result).toEqual({
        id: 'mock-download-1'
      })
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
        expect(query.sql).toEqual('select count(`id`) from `files` where `downloadId` = ? and `state` not in (?, ?)')
        expect(query.bindings).toEqual([
          'mock-download-1',
          downloadStates.completed,
          downloadStates.cancelled
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

  describe('updateFile', () => {
    test('updates the requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `files` set `state` = ? where `id` = ?')
        expect(query.bindings).toEqual([downloadStates.active, 'mock-file-1'])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })
      const database = new EddDatabase('./')

      await database.updateFile('mock-file-1', {
        state: downloadStates.active
      })
    })
  })

  describe('updateFilesWhere', () => {
    test('updates the requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('update `files` set `state` = ? where `state` = ?')
        expect(query.bindings).toEqual([
          downloadStates.pending,
          downloadStates.error
        ])

        // We aren't returning anything from this method, the above assertions are the important part of the test
        query.response([1])
      })
      const database = new EddDatabase('./')

      await database.updateFilesWhere({
        state: downloadStates.error
      }, {
        state: downloadStates.pending
      })
    })
  })

  describe('addLinksByDownloadId', () => {
    test('updates the requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('insert into `files` (`createdAt`, `downloadId`, `filename`, `percent`, `state`, `url`) select ? as `createdAt`, ? as `downloadId`, ? as `filename`, ? as `percent`, ? as `state`, ? as `url` union all select ? as `createdAt`, ? as `downloadId`, ? as `filename`, ? as `percent`, ? as `state`, ? as `url` union all select ? as `createdAt`, ? as `downloadId`, ? as `filename`, ? as `percent`, ? as `state`, ? as `url`')
        expect(query.bindings).toEqual([
          1682899200000,
          'mock-download-1',
          'file1.png',
          0,
          'PENDING',
          'http://example.com/file1.png',
          1682899200000,
          'mock-download-1',
          'file2.png',
          0,
          'PENDING',
          'http://example.com/file2.png',
          1682899200000,
          'mock-download-1',
          'file3.png',
          0,
          'PENDING',
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

  describe('getDownloadFilesProgressByDownloadId', () => {
    test('updates the requested file', async () => {
      dbTracker.on('query', (query) => {
        expect(query.sql).toEqual('select sum(`percent`) as `percentSum`, count(`id`) as `totalFiles`, count(CASE "state" WHEN "COMPLETED" THEN 1 ELSE NULL END) as `finishedFiles`, count(CASE "state" WHEN "ERROR" THEN 1 ELSE NULL END) as `erroredFiles` from `files` where `downloadId` = ?')
        expect(query.bindings).toEqual(['mock-download-1'])

        query.response([{
          percentSum: 42,
          totalFiles: 10,
          finishedFiles: 0
        }])
      })
      const database = new EddDatabase('./')

      const result = await database.getDownloadFilesProgressByDownloadId('mock-download-1')

      expect(result).toEqual({
        percentSum: 42,
        totalFiles: 10,
        finishedFiles: 0
      })
    })
  })
})
