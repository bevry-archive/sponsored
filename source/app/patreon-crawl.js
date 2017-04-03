/* eslint-env node, browser */
'use strict'

/*
const util = require('util')

function stackOrMessage (error) {
	return error.stack ? `\n${error.stack}` : util.inspect(error)


process.on('unhandledRejection', function (reason, p) {
	console.error(`\nA promise FAILED with: ${stackOrMessage(reason)}`)
	console.log(util.inspect(p))
	// process.exit(-1)
})
*/

const nightmare = require('nightmare')

function fetchPatrons ({ window, hostname, url }) {
	return window
		// .cookies.set(state.cookies)
		.goto(`${hostname}${url}`)
		.wait('.manage-rewards-list-page a .nameText')
		.evaluate(function () {
			const patrons = []
			for (const el of document.querySelectorAll('.manage-rewards-list-page')) {
				const rewardUrl = el.getAttribute('data-manage-rewards-list-page-url')

				const $link = el.querySelector('a')
				const url = $link && $link.getAttribute('href')
				const name = $link && $link.textContent.trim()
				const $email = el.querySelector('td:nth-child(3)')
				const email = $email && $email.textContent.trim()
				const $pledge = el.querySelector('td:nth-child(4)')
				const pledge = $pledge && $pledge.textContent.trim()
				const $lifetime = el.querySelector('td:nth-child(5)')
				const lifetime = $lifetime && $lifetime.textContent.trim()
				const $status = el.querySelector('td:nth-child(6)')
				const status = $status && $status.textContent.trim().toLowerCase()
				const $start = el.querySelector('td:nth-child(8)')
				const start = $start && $start.textContent.trim()
				const $charged = el.querySelector('td:nth-child(9)')
				const charged = $charged && $charged.textContent.trim()

				const patron = {rewardUrl, url, name, email, pledge, lifetime, status, start, charged}
				patrons.push(patron)
			}
			return patrons
		})
}

async function fetchMonths ({ log, window, hostname, username, password }) {
	log('info', 'logging into patreon...')
	await window
		.goto(`${hostname}/login?ru=%2FmanageRewards`)
		.type('input[name=email]', username)
		.type('input[name=password]', password)
		.click('form[name=loginForm] button.patreon-button-action')
		.wait('.pledge')

	// const cookies = await window.cookies.get()

	const months = await window.evaluate(function () {
		const months = []
		for (const el of document.querySelectorAll('.searchShareArea')) {
			const link = el.querySelector('a[href^="/manageRewardsList?billing_cycle="]')
			const date = el.querySelector('.dateBox')
			months.push({
				url: link && link.getAttribute('href'),
				date: date && date.textContent.trim()
			})
		}
		return months
	})

	log('info', `fetching the data for ${months.length} months...`)
	for (const month of months) {
		log('info', `fetching the data for ${month.date}...`)
		month.patrons = await fetchPatrons({ log, window, hostname, url: month.url })
		log('info', `fetched ${month.patrons.length} patrons`)
	}

	log('info', 'finishing up...')
	await window.end()
	log('info', 'all done')

	return months
}

async function scrape ({
	hostname = 'https://www.patreon.com',
	username = process.env.PATREON_USERNAME,
	password = process.env.PATREON_PASSWORD,
	window = nightmare(),
	log = console.log
} = {}) {
	try {
		const result = await fetchMonths({ log, window, hostname, username, password })
		// log('debug', 'result:', util.inspect(result, { colors: true, depth: 5 }))
		return result
	}
	catch (err) {
		try {
			await window.end()
		}
		catch (e) { }
		throw err
	}
}

module.exports = { nightmare, scrape }

// scrape().then(console.log).catch(console.error)
