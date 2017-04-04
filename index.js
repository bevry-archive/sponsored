/* eslint-env browser */
/* eslint class-methods-use-this:0 */
'use strict'

const m = window.m

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
	{ name: 'description', type: 'text', placeholder: 'description' },
	{ name: 'website', type: 'url', placeholder: 'website url', autocomplete: 'url' },
	{ name: 'logo', type: 'url', placeholder: 'logo url' }
]

const tiers = [
	{ cents: 500, name: 'Individual', description: 'Your sponsor listing includes a name' },
	{ cents: 3000, name: 'Freelancer', description: 'Your sponsor listing includes a name and website' },
	{ cents: 75000, name: 'Business', description: 'Your sponsor listing includes a name, website, and description' },
	{ cents: 150000, name: 'Corporate', description: 'Your sponsor listing includes a name, website, description, and logo'}
]

function renderUserTier (m, user, tier) {
	// $1500+
	const logo = user.logo && tier.cents > 150000
	// $750+
	const description = user.slogan && tier.cents > 75000
	// $30+
	const website = user.website && tier.cents > 3000
	// $5+
	const name = user.name && tier.cents > 500
	if (!name) return null

	// Render
	const title = description ? `${name}: ${description}` : name
	if (logo) {
		return website
			? m('a', { href: website, target: '_blank', title },
				m('img', { src: logo, alt: title })
			)
			: m('img', { src: logo, alt: title })
	}
	else {
		return website
			? m('span',
				m('a', { href: website, target: '_blank', title },
					name
				),
				description ? `: ${description}` : null
			)
			: m('span', title)
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

class SponsorSetup {
	view () {
		return m('section',
			m('h2', 'Sponsor Details'),
			m('form',
				fields.map((attrs) => m('input', attrs)),
				m(SubmitButton)
			)
		)
	}
}

class TierSetup {
	view () {
		return m('section',
			m('h2', 'Tier Selection'),
			m('form',
				m('select', { name: 'tier', required: true },
					tiers.map((tier) => m('option', { value: tier.cents, title: tier.description }, tier.name))
				),
				m(SubmitButton)
			)
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
