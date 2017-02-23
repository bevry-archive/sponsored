/* eslint no-console:0 */
'use strict'

const eachr = require('eachr')

function md5 (value) {
	return require('crypto').createHash('md5').update(value).digest('hex')
}

function inspect (obj) {
	return require('util').inspect(obj, {colors: true, depth: 3})
}

function log (message, ...args) {
	const details = args.map((i) => inspect(i))
	console.error(`\n\n${message}`, details.length ? '\n\n' : '', ...details)
}

function error (message, parentError) {
	let error = null
	if ( parentError ) {
		error = new Error(message + '\n' + parentError.message)
		error.stack = error.stack.concat(parentError.stack)
	}
	else {
		error = new Error(message)
	}
	console.error('\n\nERROR:', error.stack)
	return error
}

function ref (database, key) {
	return typeof key === 'string' ? database.ref(key) : key
}

function fetch (database, key) {
	log(`fetching ${key} in the database...`)
	return ref(database, key).once('value')
		.catch(function (err) {
			return error(`...couldn't fetch ${key} in the database`, err)
		})
		.then(function (snapshot) {
			log(`...fetched ${key} in the database`)
			return snapshot.val()
		})
}

function set (database, key, value) {
	log(`setting ${key} in the database...`)
	return ref(database, key).set(value)
		.catch(function (err) {
			return error(`...couldn't set ${key} in the database`, err)
		})
		.then(function () {
			log(`...set ${key} in the database`)
		})
}

function update (database, key, value) {
	log(`updating ${key} in the database...`)
	return ref(database, key).update(value)
		.catch(function (err) {
			return error(`...couldn't update ${key} in the database`, err)
		})
		.then(function () {
			log(`...updated ${key} in the database`)
		})
}

function push (database, key, value) {
	log(`pushing ${key} in the database...`)
	const r = ref(database, key).push()
	return r.set(value)
		.catch(function (err) {
			return error(`...couldn't push ${key} in the database`, err)
		})
		.then(function () {
			log(`...pushed ${r.key} in the database`)
			return r.key
		})
}

function ensure (database, key, value) {
	log(`ensuring ${key} in the database...`)
	const tasks = []
	eachr(value, function (_value, _key) {
		const slug = `${key}/${_key}`
		tasks.push(
			fetch(database, slug).then(function (val) {
				if ( val ) {
					return
				}
				else {
					return update(database, `${key}/${_key}`, _value)
				}
			})
		)
	})
	return Promise.all(tasks)
}

function fetcher (database) {
	return fetch.bind(this, database)
}

function setter (database) {
	return set.bind(this, database)
}

function updater (database) {
	return update.bind(this, database)
}

function pusher (database) {
	return push.bind(this, database)
}

function ensurer (database) {
	return ensure.bind(this, database)
}

module.exports = {md5, inspect, log, error, fetcher, setter, updater, pusher, ensurer}
