/* eslint-env browser */
/* eslint class-methods-use-this:0 */
'use strict'

const m = window.m

const state = {
	sponsor: {}
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
				m('input', { required: true, type: 'email', placeholder: 'your@patreon.email' }),
				m('input', { required: true, type: 'password', placeholder: 'your patreon password' }),
				m(SubmitButton)
			)
		)
	}
}

/*
const object = Joi.object().keys({
	email: Joi.email().required(),
	name: Joi.string().required(),
	description: Joi.string().label('tagline'),
	website: Joi.string().uri().label('website url'),
	logo: Joi.string().uri().label('logo url')
})
*/

const fields = [
	{ name: 'name', type: 'text', placeholder: 'name', autocomplete: 'name' },
	{ name: 'website', type: 'url', placeholder: 'website url', autocomplete: 'url' },
	{ name: 'description', type: 'text', placeholder: 'description' },
	{ name: 'logo', type: 'url', placeholder: 'logo url' }
]

const tiers = [
	{ cents: 500, name: 'Individual', fields: ['name'] },
	{ cents: 3000, name: 'Freelancer', fields: ['name', 'website'] },
	{ cents: 75000, name: 'Business', fields: ['name', 'website', 'description'] },
	{ cents: 150000, name: 'Corporate', fields: ['name', 'website', 'description', 'logo']}
]

function renderSponsorTier (m, sponsor, tier) {
	const { logo, description, website, name } = sponsor
	const title = description ? `${name}: ${description}` : name

	if (tier.cents >= 150000) {
		return m('a', { href: website, target: '_blank', title },
			m('img', { src: logo, alt: title })
		)
	}
	else if (tier.cents >= 75000) {
		return m('span',
			m('a', { href: website, target: '_blank', title },
				name
			),
			`: ${description}`
		)
	}
	else if (tier.cents >= 3000) {
		return m('span',
			m('a', { href: website, target: '_blank', title },
				name
			)
		)
	}
	else if (tier.cents >= 500) {
		return m('span',
			m('a', { href: website, target: '_blank', title },
				name
			)
		)
	}
}

class UserSetup {
	view () {
		return m('section',
			m('h2', 'User Details'),
			m('form',
				m('input', { name: 'email', type: 'email', placeholder: 'email', required: true, autocomplete: 'email' }),
				m('input', { name: 'name', type: 'text', placeholder: 'name', required: true, autocomplete: 'name' }),
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
				preview = renderSponsorTier(m, state.sponsor, tier) || 'the renderer returned no result'
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
