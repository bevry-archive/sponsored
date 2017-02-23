'use strict'

const eachr = require('eachr')
const {md5, error, log, setter, updater, pusher, ensurer, fetcher} = require('../util')

module.exports = function (app) {
	const set = setter(app.firebaseDatabase)
	const update = updater(app.firebaseDatabase)
	const push = pusher(app.firebaseDatabase)
	const ensure = ensurer(app.firebaseDatabase)
	const fetch = fetcher(app.firebaseDatabase)

	// fetch patreon data
	return new Promise(function (resolve, reject) {
		log('fetching patreon API data...')
		require('patreon').default(app.config.patreon.creatorsAccessToken)('current_user/campaigns?include=rewards,creator,goals,pledges', function (err, data) {
			if (err)  return reject(err)
			log('...fetched patreon API data')

			// prepare the in memory database
			const patreonDatabase = {}

			// add the items into the in memory database
			const patreonItems = data.data.concat(data.included)
			patreonItems.forEach(function (item) {
				if ( patreonDatabase[item.type] == null )  patreonDatabase[item.type] = {}
				patreonDatabase[item.type][item.id] = item
				log(`item ${item.type}/${item.id} added`)
			})

			// verify relationships
			eachr(patreonItems, function (item) {
				if ( !item.relationships || item.relationships.length === 0 ) {
					return
				}
				eachr(item.relationships, function (relationship) {
					if ( !relationship.data || relationship.data.length === 0 ) {
						return
					}
					const relations = Array.isArray(relationship.data) ? relationship.data : [relationship.data]
					eachr(relations, function (relation) {
						if ( relation && relation.type && patreonDatabase[relation.type] && relation.id && patreonDatabase[relation.type][relation.id] ) {
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
			log('fetched and processed patreon data')
			resolve(patreonDatabase)
		})

	}).then(function (patreonDatabase) {
		// save it to the database
		return Promise.resolve().then(function () {
			const tasks = []
			eachr(patreonDatabase, function (items, itemType) {
				eachr(items, function (item, itemId) {
					const p = update(`data/patreon/${itemType}/${itemId}`, item)
					tasks.push(p)
				})
			})
			return Promise.all(tasks)
		})

			// save the relations to the database
			.then(function () {
				const tasks = []
				eachr(patreonDatabase, function (items) {
					eachr(items, function (item) {
						if ( !item.relationships || item.relationships.length === 0 ) {
							return
						}
						eachr(item.relationships, function (relationship) {
							if ( !relationship.data || relationship.data.length === 0 ) {
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
				return Promise.all(tasks)
			})

			// update the user with any information
			.then(function () {
				const tasks = []
				eachr(patreonDatabase.user, function (item) {
					const user = {
						name: item.attributes.full_name,
						email: item.attributes.email
					}
					tasks.push(set(
						`relation/email/${md5(user.email)}/patreon/${item.type}/${item.id}`,
						true
					))
					tasks.push(
						fetch(`relation/email/${md5(user.email)}/user`).then(function (val) {
							const users = (val == null ? [] : Object.keys(val))
							log('users:', val, users, users[0])
							if ( users.length === 0 ) {
								return push('data/user', user).then(function (userID) {
									set(`relation/email/${md5(user.email)}/user/${userID}`, true)
								})
							}
							else if ( users.length === 1 ) {
								const userID = users[0]
								return ensure(`data/user/${userID}`, user).then(function () {
									set(`relation/email/${md5(user.email)}/user/${userID}`, true)
								})
							}
							else {
								return error(`more than one user was returned for relation/email/${md5(item.attributes.email)}`)
							}
						})
					)
				})
				return Promise.all(tasks)
			})

	}).then(app)
}
