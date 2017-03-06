'use strict'

const eachr = require('eachr')
const appUtil = require('../util')
const { error, log, clean } = appUtil

module.exports = function (app) {
	const set = appUtil.set.bind(null, app.firebaseDatabase)
	const update = appUtil.update.bind(null, app.firebaseDatabase)

	// fetch patreon data
	return new Promise(function (resolve, reject) {
		log('fetching patreon API data...')
		require('patreon').default(app.config.patreon.creatorsAccessToken)('current_user/campaigns?include=rewards,creator,goals,pledges', function (err, data) {
			if (err) return reject(err)
			log('...fetched patreon API data')

			// Start processing the items
			log('processing the patreon items...')

			// prepare the in memory database
			const patreonDatabase = {}

			// add the items into the in memory database
			const patreonItems = data.data.concat(data.included)
			patreonItems.forEach(function (item) {
				if (patreonDatabase[item.type] == null) patreonDatabase[item.type] = {}
				patreonDatabase[item.type][item.id] = clean(item)
				log(`item ${item.type}/${item.id} added`)
			})

			// verify relationships
			eachr(patreonItems, function (item) {
				if (!item.relationships || item.relationships.length === 0) {
					return
				}
				eachr(item.relationships, function (relationship) {
					if (!relationship.data || relationship.data.length === 0) {
						return
					}
					const relations = Array.isArray(relationship.data) ? relationship.data : [relationship.data]
					eachr(relations, function (relation) {
						if (relation && relation.type && patreonDatabase[relation.type] && relation.id && patreonDatabase[relation.type][relation.id]) {
							// relationship exists
						}
						else {
							// relationship missing
							throw error(`patreon item ${item.type}/${item.id} COULD NOT FIND ${relation.type}/${relation.id}`)
						}
					})
				})
			})

			// complete
			log('...processed the patreon items')
			resolve(patreonDatabase)
		})

	}).then(function (patreonDatabase) {
		// save it to the database
		return Promise.resolve().then(function () {
			const tasks = []
			log('saving the patreon items...')
			eachr(patreonDatabase, function (items, itemType) {
				eachr(items, function (item, itemId) {
					const p = update(`data/patreon/${itemType}/${itemId}`, item)
					tasks.push(p)
				})
			})
			return Promise.all(tasks).then(() => '...saved the patreon items')
		})

			// save the patreon relations
			.then(function () {
				const tasks = []
				log('relating the patreon items...')
				eachr(patreonDatabase, function (items) {
					eachr(items, function (item) {
						if (!item.relationships || item.relationships.length === 0) {
							return
						}
						eachr(item.relationships, function (relationship) {
							if (!relationship.data || relationship.data.length === 0) {
								return
							}
							const relations = Array.isArray(relationship.data) ? relationship.data : [relationship.data]
							eachr(relations, function (relation) {
								tasks.push(set(
									`relation/patreon/${item.type}/${item.id}/patreon/${relation.type}/${relation.id}`,
									true
								))
								tasks.push(set(
									`relation/patreon/${relation.type}/${relation.id}/patreon/${item.type}/${item.id}`,
									true
								))
							})
						})
					})
				})
				return Promise.all(tasks).then(() => log('..related the patreon items'))
			})

			// save the user relations
			.then(() => {
				const tasks = []
				const users = Object.values(patreonDatabase.user)
				log(`relating the ${users.length} patreon users...`, users)
				users.foreach(function (user) {
					// save email relation
					if (user.email) {
						tasks.push(set(
							`relation/email/${user.email}/opencollective/users/${user.id}`,
							true
						))
					}
					// save twitter relation
					if (user.twitter) {
						tasks.push(set(
							`relation/twitter/${user.twitter}/opencollective/users/${user.id}`,
							true
						))
					}
				})
				return Promise.all(tasks).then(() => log('...relating the patreon users'))
			})

	}).then(() => app)
}
