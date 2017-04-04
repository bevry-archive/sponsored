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
			m('span.action', 'Remote Database'),
			' or ',
			m('span.action', 'Local Database')
		)
	}
}

class PatreonSetup {
	view () {
		return m('section',
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
	{ name: 'name', type: 'text', placeholder: 'name', required: true, autocomplete: 'name' },
	{ name: 'website', type: 'url', placeholder: 'website url', autocomplete: 'url' },
	{ name: 'description', type: 'text', placeholder: 'description' },
	{ name: 'logo', type: 'url', placeholder: 'logo url' }
]

const tiers = [
	{ cents: 0, name: 'No Tier', description: 'You will not have a sponsored listing'}
].concat([
	{ cents: 500, name: 'Individual', description: 'Will display the name field' },
	{ cents: 3000, name: 'Freelancer', description: 'Will display the name and website fields' },
	{ cents: 75000, name: 'Business', description: 'Will display the name, website, and description fields' },
	{ cents: 150000, name: 'Corporate', description: 'Will display the name, website, description, and logo fields'}
])

function renderSponsorTier (m, sponsor, tier) {
	// $1500+
	const logo = tier.cents >= 150000 && sponsor.logo
	// $750+
	const description = tier.cents >= 75000 && sponsor.description
	// $30+
	const website = tier.cents >= 3000 && sponsor.website
	// $5+
	const name = tier.cents >= 500 && sponsor.name
	if (!name) return null

	// Render
	const title = description ? `${name}: ${description}` : name
	const result =
		logo
		? (website
			? m('a', { href: website, target: '_blank', title },
				m('img', { src: logo, alt: title })
			)
			: m('img', { src: logo, alt: title })
		)
		:	(website
			? m('span',
				m('a', { href: website, target: '_blank', title },
					name
				),
				description ? `: ${description}` : null
			)
			: m('span', title)
			)
	console.log(result)
	return result

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

class SponsorSetup {
	change (attrs, e) {
		state.sponsor[attrs.name] = e.target.value
		console.log(state.sponsor)
	}

	view () {
		return m('section',
			m('h2', 'Sponsor Details'),
			m('form',
				fields.map((attrs) => m('input',
					Object.assign({
						onkeyup: this.change.bind(this, attrs),
						onchange: this.change.bind(this, attrs),
						value: state.sponsor[attrs.name]
					}, attrs)
				)),
				m(SubmitButton)
			)
		)
	}
}

class EmptySponsorTier {
	view () {
		return m('span', 'You have not filled out enough Sponsor Details for this tier to display')
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
	change (e) {
		this.value = Number(e.target.value)
	}
	view () {
		const value = this.value == null ? tiers[0].cents : this.value
		const tier = tiers.find((tier) => tier.cents === value)
		let duration = value
			? Math.floor(credit / value) + ' months'
			: 'indefinitely'
		if ( duration === '1 months') {
			duration = '1 month'
		}
		return m('section',
			m('h2', 'Tier Selection'),
			m('p', `You have ${renderCents(credit)} available`),
			m('form',
				m('select', {
					name: 'tier',
					required: true,
					value,
					onchange: this.change.bind(this)
				},
					tiers.map((tier) => m('option', {
						value: tier.cents,
						title: tier.description,
						disabled: tier.cents > credit
					},
						`${tier.name} (${renderTierAmount(tier)})`
					))
				),
				m(SubmitButton)
			),
			m('p', tier.description),
			value ? [
				m('p', `With your credit, your tier selection will continue ${duration}`),
				m('p', 'It will look like this:'),
				m('.preview',
					renderSponsorTier(m, state.sponsor, tier) || m(EmptySponsorTier)
				)
			] : ''
		)
	}
}

class App {
	view () {
		return m('article',
			m('section.sidebar',
				m('h1', 'Welcome to Sponsored'),
			),
			m('section.mainbar',
				m(DatabaseSetup),
				m(PatreonSetup),
				m(PatreonButton),
				m(UserSetup),
				m(SponsorSetup),
				m(TierSetup)
			)
		)
	}
}



m.mount(document.body, App)
