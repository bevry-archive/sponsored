# Data

## Database

``` javascript
{
  "config": {
    "patreon": {
      "clientId": null,
      "clientSecret": null,
      "creatorsAccessToken": null,
      "creatorsRefreshToken": null,
      "creatorsTokenExpiry": null
    }
  },
  "data": {
    "opencollective": {
      "user": {
        "[user.id]": "opencollective api data"
      }
    },
    "patreon": {
      "[item.type]": {
        "[item.id]": "patreon api data"
      }
    },
    // still planning
    "sponsored": {
      "tiers": [500, 3000, 75000, 150000],  // still planning
      "user": {
        "[firebase push id]": {
          "name": "user set",
          "emails": "user set",
          "patreonId": "user set",
          "opencollectiveId": "user set",
          // still planning
          "patronage": {
            // total amount given to date
            "given": 3000,
            // total amount cashed to date
            "spent": 0,
            // current month bill (highest tier from given-spent)
            "active": 3000
          },
          // still planning
          "sponsorDetails": {
            "name": null,
            "email": null,
            "desription": null,
            "logo": null
          }
        }
      }
    }
  },
  "relations": {
    "twitter": {
      "[twitter.username]": {
        "[data-service - e.g. opencollective, patreon, sponsored]": {
          "user": {
            "[user.id]": true
          }
        }
      }
    },
    "email": {
      "[hashed email]": {
        "[data-service - e.g. opencollective, patreon, sponsored]": {
          "user": {
            "[user.id]": true
          }
        }
      }
    }
  }
}
```


## Services

### Patreon

Data is quite long. So just see firebase result.

### Open Collective

https://opencollective.com/bevry/members.json

``` json
[
    {
        "id": 728,
        "createdAt": "2016-07-06T08:31:17.224Z",
        "name": "Benjamin Lupton",
        "firstName": "Benjamin",
        "lastName": "Lupton",
        "username": "benjaminlupton",
        "role": "MEMBER",
        "avatar": "https://avatars.githubusercontent.com/balupton",
        "website": "https://balupton.com",
        "twitterHandle": null,
        "totalDonations": null,
        "firstDonation": null,
        "lastDonation": null,
        "tier": "core contributor",
        "index": 0
    },
    {
        "id": 729,
        "createdAt": "2016-07-06T08:31:17.700Z",
        "name": "Steve Mc",
        "firstName": "Steve",
        "lastName": "Mc",
        "username": "stevemc",
        "role": "MEMBER",
        "avatar": "https://avatars.githubusercontent.com/SteveMcArthur",
        "website": "http://www.stevemcarthur.co.uk",
        "twitterHandle": null,
        "totalDonations": null,
        "firstDonation": null,
        "lastDonation": null,
        "tier": "core contributor",
        "index": 1
    },
    {
        "id": 730,
        "createdAt": "2016-07-06T08:31:17.705Z",
        "name": "Michael Duane Mooring",
        "firstName": "Michael",
        "lastName": "Duane Mooring",
        "username": "michaelduanemooring",
        "role": "MEMBER",
        "avatar": "https://avatars.githubusercontent.com/mikeumus",
        "website": "https://mikeum.us",
        "twitterHandle": null,
        "totalDonations": null,
        "firstDonation": null,
        "lastDonation": null,
        "tier": "core contributor",
        "index": 2
    },
    {
        "id": 1766,
        "createdAt": "2016-11-12T08:48:18.569Z",
        "name": "Jean-Luc Geering",
        "firstName": "Jean-Luc",
        "lastName": "Geering",
        "username": "jlgeering16",
        "role": "BACKER",
        "avatar": "https://opencollective-production.s3-us-west-1.amazonaws.com/a5c35ae0-a8b1-11e6-b03f-7d1c58dd13b8.png",
        "website": null,
        "twitterHandle": "jlgeering",
        "totalDonations": 2000,
        "firstDonation": "2016-11-12T08:48:22.646Z",
        "lastDonation": "2017-02-12T09:48:45.514Z",
        "tier": "User Sponsor",
        "index": 3
    }
]
```