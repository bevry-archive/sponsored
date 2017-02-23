/* eslint no-console:0 */
'use strict'

const {log, fetcher, updater} = require('../util')

module.exports = function setupPatreon (app) {
	const fetch = fetcher(app.firebaseDatabase)
	const update = updater(app.firebaseDatabase)

	return fetch('config/patreon')
		.then(function (databasePatreonConfig) {
			const mergedPatreonConfig = Object.assign({}, app.config.patreon, databasePatreonConfig)
			log('merged fetched patreon config with environment config', mergedPatreonConfig)
			return mergedPatreonConfig
		})
		.then(function (mergedPatreonConfig) {
			return new Promise(function (resolve, reject) {
				if ( new Date(mergedPatreonConfig.creatorsTokenExpiry).getTime() > new Date().getTime() ) {
					log('patreon config is suitable')
					return resolve(mergedPatreonConfig)
				}
				log('refreshing patreon config...')
				require('patreon').oauth(mergedPatreonConfig.clientId, mergedPatreonConfig.clientSecret).refreshToken(mergedPatreonConfig.creatorsRefreshToken, function (err, result) {
					if ( err || result.error )  return reject(err || result.error)
					const latestPatreonConfig = Object.assign({}, mergedPatreonConfig, {
						creatorsTokenExpiry: new Date(new Date().getTime() + Number(result.expires_in)).getTime(),
						creatorsAccessToken: result.access_token,
						creatorsRefreshToken: result.refresh_token
					})
					log('...refreshed patreon config', latestPatreonConfig)
					resolve(latestPatreonConfig)
				})
			})
		})
		.then(function (latestPatreonConfig) {
			return update('config/patreon', latestPatreonConfig).then(function () {
				app.config.patreon = latestPatreonConfig
				return app
			})
		})
}
