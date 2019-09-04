export const fields = [
	{ name: 'name', type: 'text', placeholder: 'Name', autocomplete: 'name' },
	{ name: 'website', type: 'url', placeholder: 'Website URL', autocomplete: 'url' },
	{ name: 'description', type: 'text', placeholder: 'Description' },
	{ name: 'logo', type: 'url', placeholder: 'Logo URL' }
]

export const tiers = [
	{ cents: 500, name: 'Individual', fields: ['name'] },
	{ cents: 3000, name: 'Freelancer', fields: ['name', 'website'] },
	{ cents: 75000, name: 'Business', fields: ['name', 'website', 'description'] },
	{ cents: 150000, name: 'Corporate', fields: ['name', 'website', 'description', 'logo'] }
]

export function renderSponsorEntry (m, sponsor, tier) {
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
