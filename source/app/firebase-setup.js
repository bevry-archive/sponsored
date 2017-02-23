/* eslint no-console:0 */
'use strict'

const {log} = require('../util')

module.exports = function setupFirebase (app) {
	return new Promise(function (resolve) {
		const firebaseClient = app.config.firebase.credential ? require('firebase-admin') : require('firebase')
		log('loaded firebase configuration:', app.config.firebase)
		const firebaseApp = firebaseClient.initializeApp(
			app.config.firebase.credential
			? {
				databaseURL: app.config.firebase.databaseURL,
				credential: firebaseClient.credential.cert(app.config.firebase.credential)
			}
			: app.config.firebase
		)
		const firebaseDatabase = firebaseApp.database()
		app.firebaseDatabase = firebaseDatabase
		resolve(app)
	})
}
