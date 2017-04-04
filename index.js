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
			m('input', { type: 'email', placeholder: 'your@patreon.email' }),
			m('input', { type: 'password', placeholder: 'your patreon password' }),
			m('span.action', 'Proceed →')
		)
	}
}

class PatreonButton {
	view () {
		return m('span.action.patreon', 'Login with Patreon →')
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
				m(PatreonButton)
			)
		)
	}
}



m.mount(document.body, App)
