# Specification

## API

The following is fairly new, consider it:

``` javascript
const sponsorServer = require('sponsored-server')
const {encodeXML, encodeHTML} = require('entities')

sponsorServer({
	firebase: {
		// firebase both config
		databaseURL: process.env.FIREBASE_DATABASE_URL,

		// firebase user config
		apiKey: process.env.FIREBASE_API_KEY,
		authDomain: process.env.FIREBASE_AUTH_DOMAIN,
		storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,

		// firebase admin config
		credential: process.env.FIREBASE_CREDENTIAL && JSON.parse(new Buffer(process.env.FIREBASE_CREDENTIAL, 'base64').toString('ascii'))
	},
	patreon: {
		clientId: process.env.PATREON_CLIENT_ID,
		clientSecret: process.env.PATREON_CLIENT_SECRET,
		creatorsAccessToken: process.env.PATREON_CREATORS_ACCESS_TOKEN,
		creatorsRefreshToken: process.env.PATREON_CREATORS_REFRESH_TOKEN
	},
	auth0: {
		clientDomain: process.env.AUTH0_CLIENT_DOMAIN,
		clientId: process.env.AUTH0_CLIENT_ID,
		clientSecret: process.env.AUTH0_CLIENT_SECRET,
		redirectURL: null // 'http://localhost:3000/login'
	},
	detailsForm () {
		return [
			'<form action="" method="POST">',
			'<p><label>Name</label><input name="name" type="name" /></p>',
			'<p><label>Website URL</label><input name="website" type="url" /></p>',
			'<p><label>Slogan</label><input name="slogan" type="text" /></p>',
			'<p><label>Logo URL</label><input name="logo" type="url" /></p>',
			'</form>'
		].join('\n')
	},
	detailsResult (user, pledge) {
		// $1500+
		const logo = user.logo && pledge.cents > 150000
		// $750+
		const description = user.slogan && pledge.cents > 75000
		// $30+
		const website = user.website && pledge.cents > 3000
		// $5+
		const name = user.name && pledge.cents > 500
		if ( !name )  return null

		// Always
		const email = user.email

		// Render HTML
		const htmlTitle   = description ? `${name}: ${description}` : name
		const htmlContent = logo ? `<img src="${encodeXML(logo)} alt="${encodeXML(htmlTitle)}" />` : encodeHTML(htmlTitle)
		const html = website ? `<a href="${encodeXML(website)}" target="_blank" title="${encodeXML(htmlTitle)}">${htmlContent}</a>` : htmlContent

		// Render Text
		const text = [name, email && `<${email}>`, website].filter((i) => Boolean(i)).join(' ')

		// Render Data
		const data = {name, email}
		if ( logo )  data.logo = logo
		if ( description )  data.description = description
		if ( website )  data.website = website

		// Return
		return {html, data, text}
	}
})
```

Perhaps can use the npm package `joi` to some extent.




# Old

The following is fairly old, ignore it.

## source/index.js

## manual/org.json

``` javascript
[{name: "blah", email: "blah", url: "", tagline: "", logo: ""}]
```

## aliases.json

``` javascript
{"docpad": "bevry"}
```

## source/index.js

## source/config.js

``` javascript
export default {
    // al environment variables
    site: {
        patreon_username: "bevry",  // be environment variable so anyone can deploy this
        patreon_token: process.env.PATREON_ACCESS_TOKEN,
        stripe_token: blah,
        paypal_token: blah,
        // URLs to ping after completion
    },

    // optional
    invoices: {  // invoices for people that have been sent },

    // optional
    persons: {  // fixtures for people, specified by company or by people themselves
        "id": {
            // some other id
            "email": "",
            "github": "id",
            // details for tier
            name: "",
            email: "",
            tagline: "",
            url: "",
            logo: "",
            // any previous details from manual sponsorships etc
            // ...
        }
    }
}
```

## firebase database (if firebase connection does not exist)

``` javascript
// each day this starts off as empty
{
    tiers: {  // if not defined, fetched from patreon rewards and analysed for details
        5: {
            name: true,

            readme: true
        },
        30: {
            name: true,
            url: true,

            readme: true
        },
        750: {
            name: true,
            url: true,
            tagline: true,

            readme: true
        },
        1500: {
            name: true,
            url: true,
            tagline: true,
            logo: true,

            readme: true,
            website: true
        },
        3000: {
            name: true,
            url: true,
            tagline: true,
            logo: true,

            readme: true,
            website: true,
            footer: true,
            social: true
        }
    }

    people: {
        // each service is fetched
        github: {
            "id": {
                // github details
            }
        },
        patreon: {
            "id": {
                // patreon details
                lastPledgeDate
            }
        },
        stripe: {
            "id": {
                // stripe details
                lastPaymentDate
            }
        },

        // while services are fetching, they are adding ids to this email has
        emails: {
            "email": {
                // places this email is in use
                github: "id",
                patreon: "id",
                stripe: "id",
                manual: "id"
            },
            "email": {
                // places this email is in use
                github: "id"
            }
        },

        // once that is done, ids that are shared over multiple emails have the email details merged
        merged: {
            "uuid": {
                "patreon": "id",
                "github": "id",
                "stripe": "id",
                manual: "id"
            }
        }

        // once all merged, each person has their details filled in
        finished: {
            "uuid": { // emails are not exposed ever
                // auto and cached
                // manual || github || stripe || patreon
                name: "",
                url: "",
                tagline: "",
                logo: "",
                // culmative
                monthTotal: "" // how much over past 4 weeks, active if not 0
                foreverTotal: "" // how much since forever, in backers if not 0
                tier: "", // tier id
                tierDetails: {
                    name: "",
                    email: "",
                    tagline: "",
                    url: "",
                    logo: "",
                    readme: true,
                    website: true,
                    footer: true,
                    social: true
                }  // trimmed user details for the tier

                // manual and cached
                // previous
                "patreon": "id",
                "github": "id",
                "stripe": "id",
                manual: "id"
            }
        }, // <-- this is then exposed via an api for project build tools to fetch

        // finally, websites are recompiled
        // projects may or may not be auto updated... still to decide on this
        // PROJECTS ARE NOT TO BE AUTO-UPDATED, would be too difficult on merging, branches, etc
    }
}
```


``` javascript
class Person () {
    id = 'uuid';
    patreon = {};
    stripe = {};
    manual = {};

    static getUserByEmail (email) {
        people.find({emails:

    get name () {
        return manual.name || stripe.name || patreon.full_name
    }

    get email () {
        return (manual.emails || [])[0] || stripe.email || patreon.email
    }

    get emails () {
        return (manual.emails || []).concat([patreon.email, stripe.email]
    }

    get url () {
        return manual.url || stripe.url || patreon.url
    }

    get tagline () {
        return manual.tagline || stripe.tagline || patreon.about
    }

    get logo () {
        return manual.logo || stripe.logo || patreon.image_url
    }

    get active () {
        return [stripe.lastPaymentDate, patreon.lastPledgeDate].some((date) => date && date > new Date('-4 weeks'))
    }
}
```
