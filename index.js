/* eslint-env browser */
/* eslint class-methods-use-this:0 */
'use strict'

const m = window.m

class DatabaseSetup {
	view () {
		return m('section',
			m('span.button', 'Remote Database'),
			' or ',
			m('span.button', 'Local Database')
		)
	}
}

class PatreonSetup {
	view () {
		return m('section',
			m('p', 'To fetch your patreon sponsors we need to crawl the patreon website. To do this, we need your patreon username and password.'),
			m('input', { type: 'email', placeholder: 'your@patreon.email' }),
			m('input', { type: 'password', placeholder: 'your patreon password' }),
			m('span.button', 'Proceed →')
		)
	}
}

class App {
	view () {
		return m('article',
			m('h1', 'Welcome to Sponsored'),
			m('ol.steps',
				m('li',
					m('section',
						m('h2', 'Database'),
						m(DatabaseSetup)
					)
				),
				m('li.active',
					m('section',
						m('h2', 'Patreon'),
						m(PatreonSetup)
					)
				),
				m('li', m('h2', 'Open Collective'))
			)
		)
	}
}



m.mount(document.body, App)
