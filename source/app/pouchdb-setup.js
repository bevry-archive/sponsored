'use strict'

const PouchDB = require('pouchdb-node')

module.exports = function setupPouch (app) {
	return new Promise(function (resolve) {
		app.pouchDatabase = new PouchDB(app.config.pouchdb.uri, app.config.pouchdb.options || {})
		resolve(app)
	})
}
