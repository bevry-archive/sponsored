/* global m */
/* eslint-env browser */
/* eslint class-methods-use-this:0 */

import { fields, tiers, renderSponsorEntry } from './config.js'

const state = {
	'sponsor': {},
	'2fa': false
}

class PatreonButton {
	view () {
		return m('span.action.patreon', 'Login with Patreon →')
	}
}

class SubmitButton {
	submit (e) {
		const el = e.target
		const submit =	el.parentNode.lastElementChild
		submit.click()
	}
	view () {
		return m('span',
			m('.action.submit', { onclick: this.submit.bind(this) },
				'Proceed →'
			),
			m('input.hide', { type: 'submit' })
		)
	}
}

class DatabaseSetup {
	view () {
		return m('section',
			m('h2', 'Database Setup'),
			m('span.action', 'Remote Database'),
			' or ',
			m('span.action', 'Local Database')
		)
	}
}

class PatreonSetup {
	view () {
		return m('section',
			m('h2', 'Patreon Setup'),
			m('p', 'To fetch your patreon sponsors we need to crawl the patreon website. To do this, we need your patreon username and password.'),
			m('form',
				m('input', { required: true, type: 'email', placeholder: 'Your Patreon Email' }),
				m('input', { required: true, type: 'password', placeholder: 'Your Patreon Password' }),
				m(SubmitButton)
			),
			(state['2fa'] || null) && m('form',
				m('input', { required: true, type: 'number', placeholder: 'Your Patreon 2FA Code' }),
				m(SubmitButton)
			)
		)
	}
}

class UserSetup {
	view () {
		return m('section',
			m('h2', 'User Details'),
			m('form',
				m('input', { name: 'email', type: 'email', placeholder: 'Email', required: true, autocomplete: 'email' }),
				m('input', { name: 'name', type: 'text', placeholder: 'Name', required: true, autocomplete: 'name' }),
				m(SubmitButton)
			)
		)
	}
}

const credit = tiers.slice(-1)[0].cents

function renderCents (cents, decimal = true) {
	return '$' + (
		decimal
		? (cents / 100).toFixed(2)
		: Math.ceil(cents / 100)
	)
}

function renderTierAmount (tier) {
	return renderCents(tier.cents, false) + '/month'
}

class TierSetup {
	changeTier (e) {
		const cents = Number(e.target.value)
		const tier = tiers.find((tier) => tier.cents === cents)
		state.tier = tier
	}
	changeField (attrs, e) {
		state.sponsor[attrs.name] = e.target.value
	}

	view () {
		const tier = state.tier
		const value = (tier && tier.cents) || 0
		let duration, preview, description = 'Select a sponsor tier to have your chosen details show up in sponsor listings'
		if (tier) {
			duration = Math.floor(credit / tier.cents) + ' months'
			description = tier.description // || `Makes use of the fields: ${tier.fields.join(', ')}`
			const missing = []
			tier.fields.forEach(function (field) {
				if ( !state.sponsor[field] )  missing.push(field)
			})
			if (missing.length) {
				preview = `Missing the fields: ${missing.join(', ')}`
			}
			else {
				preview = renderSponsorEntry(m, state.sponsor, tier) || 'the renderer returned no result'
			}
		}
		return m('section.tier-setup',
			m('form',
				m('h2', 'Sponsor Tier'),
				m('p', `You have ${renderCents(credit)} of credit available`),
				(value || null) && m('p', `With your credit, your sponsor tier selection will continue ${duration}`),

				m('fieldset',
					m('select', {
						name: 'tier',
						required: true,
						value,
						onchange: this.changeTier.bind(this)
					},
						m('option', { value: 0 }, 'No Tier'),
						tiers.map((tier) => m('option', {value: tier.cents, disabled: tier.cents > credit},
							`${tier.name} (${renderTierAmount(tier)})`
						))
					),
					m(SubmitButton)
				),

				(description || null) && m('p', description),
				// (value || null) && m('h3', 'Fields'),
				(value || null) && m('p', 'Fill in these fields to display your sponsor listing:'),
				m('fieldset', (value || null) && fields.map((attrs) => (tier.fields.indexOf(attrs.name) !== -1 || null) && m('input',
					Object.assign({
						required: true,
						onkeyup: this.changeField.bind(this, attrs),
						onchange: this.changeField.bind(this, attrs),
						value: state.sponsor[attrs.name]
					}, attrs)
				))),
				// (value || null) && m('h3', 'Sponsor Listing Preview'),
				(value || null) && m('p', 'This is how your listing will look like:'),
				(value || null) && m('.preview', preview)
			)
		)
	}
}

class App {
	view () {
		return m('article',
			m('section.sidebar',
				m('h1', 'Welcome to Sponsored')
			),
			m('section.mainbar',
				m(PatreonButton),
				m(DatabaseSetup),
				m(PatreonSetup),
				m(UserSetup),
				m(TierSetup)
			)
		)
	}
}



m.mount(document.body, App)
