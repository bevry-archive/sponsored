<!-- TITLE -->

<!-- BADGES -->

<!-- DESCRIPTION -->

<!-- INSTALL -->

## SPEC

### source/index.js

### manual/org.json

``` javascript
[{name: "blah", email: "blah", url: "", tagline: "", logo: ""}]
```

### aliases.json

``` javascript
{"docpad": "bevry"}
```

### source/index.js

### source/config.js

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

### firebase database (if firebase connection does not exist)

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

<!-- HISTORY -->

<!-- CONTRIBUTE -->

<!-- BACKERS -->

<!-- LICENSE -->
