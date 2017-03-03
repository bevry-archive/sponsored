'use strict'

const request = require('node-fetch')
const appUtil = require('../util')
const { log, error, clean } = appUtil

module.exports = function (app) {
	const update = appUtil.update.bind(null, app.firebaseDatabase)
	const ensureUser = appUtil.ensureUser.bind(null, app.firebaseDatabase)
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
			log(`correlating the ${users.length} opencollective users...`)
			return Promise.all(
				users.map((user) => Promise.all([
					// push to opencollective database
					update(
						`data/opencollective/users/${user.id}`,
						user
					),
					// push to user database
					ensureUser({
						name: `${user.firstName} ${user.lastName}`,
						twitter: user.twitterHandle || null,
						opencollective: `opencollective/users/${user.id}`
					})
				]))
			).then(() => log('...correlated the opencollective users'))
		})
		.then(() => app)
}
