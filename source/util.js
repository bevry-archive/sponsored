/* eslint no-console:0 */
'use strict'

const eachr = require('eachr')

function md5 (value) {
	return require('crypto').createHash('md5').update(value).digest('hex')
}

function inspect (obj) {
	return require('util').inspect(obj, { colors: true, depth: 3 })
}

function log (message, ...args) {
	const details = args.map((i) => inspect(i))
	console.error(`\n\n${message}`, details.length ? '\n\n' : '', ...details)
}

function error (message, parentError) {
	let error = null
	if (parentError) {
		error = new Error(message + '\n' + parentError.message)
		error.stack = error.stack.concat(parentError.stack)
	}
	else {
		error = new Error(message)
	}
	console.error('\n\nERROR:', error.stack)
	return error
}

// return object cleaned of empty values
function clean (object) {
	const newObject = {}
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			let value = object[key]
			const type = typeof value
			if ( type === 'string') {
				value = value.trim()
			}
			else if (type === 'object') {
				value = clean(value)
			}
			newObject[key] = value
		}
	}
	return newObject
}

// returns reference
function ref (database, key) {
	if (typeof key === 'string') {
		try {
			return database.ref(key)
		}
		catch (err) {
			return Promise.reject(
				error(`couldn't reference ${key} from the database`, err)
			)
		}
	}
	else {
		return key
	}
}

// returns get value
function get (database, key) {
	log(`getting ${key} from the database...`)
	return ref(database, key).once('value')
		.catch(function (err) {
			return error(`...couldn't get ${key} from the database`, err)
		})
		.then(function (snapshot) {
			log(`...got ${key} from the database`)
			return snapshot.val()
		})
}

// returns key
function set (database, key, value) {
	log(`setting ${key} in the database...`)
	return ref(database, key).set(value)
		.catch(function (err) {
			return error(`...couldn't set ${key} in the database`, err)
		})
		.then(function () {
			log(`...set ${key} in the database`)
			return key
		})
}

// returns key
function update (database, key, value) {
	log(`updating ${key} in the database...`)
	return ref(database, key).update(value)
		.catch(function (err) {
			return error(`...couldn't update ${key} in the database`, err)
		})
		.then(function () {
			log(`...updated ${key} in the database`)
			return key
		})
}

// returns key
function push (database, key, value) {
	log(`pushing ${key} in the database...`, value)
	const r = ref(database, key).push()
	return r.set(value)
		.catch(function (err) {
			return error(`...couldn't push ${key} in the database`, err)
		})
		// .then((key) => set(database, `${key}/id`, key))
		.then(function () {
			log(`...pushed ${r.key} in the database`)
			return r.key
		})
}

// returns key
function ensure (database, key, value) {
	log(`ensuring ${key} in the database...`)
	const tasks = []
	eachr(value, function (_value, _key) {
		const slug = `${key}/${_key}`
		tasks.push(
			get(database, slug).then(function (val) {
				// as this is an ensure, we only want to set the value if:
				// 1. the old value doesn't already exist
				// 2. the new value actually exists
				if ( val != null || value == null ) {
					return key
				}
				else {
					return set(database, `${key}/${_key}`, _value)
				}
			})
		)
	})
	return Promise.all(tasks)
}

// returns key
function ensureUserIdentification (database, user, key, value) {
	Promise.resolve()
		.then(function () {
			if (user.id) {
				return ensure(database, `data/user/${user.id}`, user)
					.then((id) => set(database, `relation/${key}/${value}/user/${id}`, true))
			}
			else {
				return get(database, `relation/${key}/${value}/user`).then(function (val) {
					const users = (val == null ? [] : Object.keys(val))
					// check for creation
					if (users.length === 0) {
						return push(database, 'data/user', user)
							.then((id) => set(database, `relation/${key}/${value}/user/${id}`, true))
					}
					// check for update
					else if (users.length === 1) {
						const id = users[0]
						return ensure(database, `data/user/${id}`, user)
					}
					// we have more than one user sharing this email, this is an error condition
					else {
						return error(`more than one user was returned for relation/${key}/${value}`)
					}
				})
			}
		})
}

// returns key
// @TODO
// This approach is not the correct approach
// it can be rectified by expanding the code - to check for each identification phase - to fetch a user id - then after that, if a user id exists, then update the user for each value, then add the relations
// HOWEVER, not all identifications are know at once, so duplicate users may still be created
// as such this type of juxtaposition of a user by multiple potential users is not suitable
// INSTEAD, the different potential users should handle their relations accordingly
// and instead, user registration should occur, and becomes the source of truth
// if the official user details then match a sub-user/potential-user then they are linked, in a top-down fashion
// links only occur with verified details, and with user confirmation, as one cannot completely trust the external source that the detail is verified - however if details match, and the user confirms, then high probability they are the same
// THIS, approach will take some time, perhaps another few days, but will be good, as it ties into the planned login functionality anyway
// AUTH0 makes sense, as if the official user verifies with each login, then that makes things easier
function ensureUser (database, user) {
	log('ensure user:', user)
	// this is done as a chain, instead of promise.all
	// as we need to ensure that only one push is done at a time
	return Promise.resolve()
		.then(function () {
			const value = user.email && md5(user.email.trim().toLowerCase())
			if (value) return ensureUserIdentification(database, user, 'email', value)
		})
		.then(function (value) {
			const id = user.twitter && user.twitter.trim().toLowerCase()
			if (value) return ensureUserIdentification(database, user, 'twitter', value)
		})
		.then(function (key) {
			if ( !key ) {
				log('skipping ensure user as they have no identification values:', user)
			}
		})
}

module.exports = { md5, inspect, log, error, clean, get, set, update, push, ensure, ensureUser }
