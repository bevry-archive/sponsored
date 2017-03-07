'use strict'

const request = require('node-fetch')
const appUtil = require('../util')
const { log, error, clean } = appUtil

module.exports = function (app) {
	const update = appUtil.update.bind(null, app.firebaseDatabase)
	const set = appUtil.set.bind(null, app.firebaseDatabase)
	const url = `https://opencollective.com/${app.config.opencollective.collective}/members.json`
	// fetch opencollective data
	log('fetching open collective API data...')
	return request(url)
		.catch((err) => error(`failed to fetch ${url}`, err))
		.then((response) => response.json())
		.catch((err) => error(`failed to parse ${url}`, err))
		.then(function (users) {
			log('...fetched open collective API data')
			if (!Array.isArray(users)) {
				return error('the response from open collective was invalid')
			}
			log(`resulted in ${users.length} opencollective users`)
			return users.map((user) => clean(user))
		})
		.then(function (users) {
			log(`relating the ${users.length} opencollective users...`)
			const tasks = []
			users.forEach(function (user) {
				// save to opencollective database
				tasks.push(update(
					`data/opencollective/user/${user.id}`,
					user
				))
				// save twitter relation
				if (user.twitterHandle) {
					tasks.push(set(
						`relation/twitter/${user.twitterHandle}/opencollective/user/${user.id}`,
						true
					))
				}
			})
			return Promise.all(tasks).then(() => log('...related the opencollective users'))
		})
		.then(() => app)
}
