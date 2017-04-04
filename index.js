/* eslint-env browser */
/* eslint class-methods-use-this:0 */
'use strict'

const m = window.m

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
				m('input.action', { type: 'submit', value: 'Proceed →' })
			)
		)
	}
}

class PatreonButton {
	view () {
		return m('span.action.patreon', 'Login with Patreon →')
	}
}


class AccountSetup {
	view () {
		return m('section',
			m('form',
				m('h2', 'Sponsor Details'),
				m('input', { required: true, name: 'email', type: 'email', placeholder: 'email', autocomplete: 'email' }),
				m('input', { required: true, name: 'name', type: 'text', placeholder: 'name', autocomplete: 'name' }),
				m('input', { name: 'description', type: 'text', placeholder: 'tagline' }),
				m('input', { name: 'website', type: 'url', placeholder: 'website url', autocomplete: 'url' }),
				m('input', { name: 'logo', type: 'url', placeholder: 'logo url' }),
				m('input.action', { type: 'submit', value: 'Proceed →' })
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
				m(AccountSetup)
			)
		)
	}
}



m.mount(document.body, App)
