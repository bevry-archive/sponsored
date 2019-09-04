/* eslint camelcase:0 no-console:0 */
'use strict'

const extendr = require('extendr')
const pathUtil = require('path')
const {log} = require('./util')

module.exports = function (config = {}) {
	const app = {
		config: extendr.deep({
			pouchdb: {
				uri: pathUtil.join(process.cwd(), './database')
			},
			firebase: {
				// firebase both config
				databaseURL: process.env.FIREBASE_DATABASE_URL,

				// firebase user config
				apiKey: process.env.FIREBASE_API_KEY,
				authDomain: process.env.FIREBASE_AUTH_DOMAIN,
				storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
				messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,

				// firebase admin config
				credential: process.env.FIREBASE_CREDENTIAL && JSON.parse(new Buffer(process.env.FIREBASE_CREDENTIAL, 'base64').toString('ascii'))
			},
			patreon: {
				clientId: process.env.PATREON_CLIENT_ID,
				clientSecret: process.env.PATREON_CLIENT_SECRET,
				creatorsAccessToken: process.env.PATREON_CREATORS_ACCESS_TOKEN,
				creatorsRefreshToken: process.env.PATREON_CREATORS_REFRESH_TOKEN
			},
			auth0: {
				clientDomain: process.env.AUTH0_CLIENT_DOMAIN,
				clientId: process.env.AUTH0_CLIENT_ID,
				clientSecret: process.env.AUTH0_CLIENT_SECRET,
				redirectURL: null // 'http://localhost:3000/login'
			},
			opencollective: {
				collective: 'bevry'
			}
		}, config)
	}

	return Promise.resolve(app)
		.then(require('./app/pouchdb-setup'))
		.then(require('./app/patreon-setup'))
		.then(require('./app/patreon-data'))
		.then(require('./app/opencollective-data'))
		.then(() => log('DONE'))
		.catch((...args) => log('FAILED', ...args))
}
