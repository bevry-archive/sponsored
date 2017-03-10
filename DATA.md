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
    "sponsored": {
      "user": {
        "[firebase push id]": {
          "emails": ["email@domain.com"],
          "patreon": 123,
          "opencollective": 123,
          "gratipay": 123,
          "credits": [
            {
              "source": "patreon",
              "month": "2016-02",
              "amount": 500,
              "pledge": 123
            },
            {
              "source": "opencollective",
              "month": "2016-02",
              "amount": 500
            },
            {
              "source": "gratipay",
              "date": "2016-02-08",
              "amount": 500
            },
            {
              "source": "manual",
              "date": "2016-02-08",
              "amount": 500
            }
          }
          "debits": [
            {
              "source": "sponsored",
              "month": "2017-03",
              "amount": 3000
            }
          ],
          "fields": {
            "name": "Name",
            "email": "email@domain.com",
            "url": "https://domain.com",
            "desription": "this is what the user has requested be displayed in their sponsor listing",
            "logo": "https://domain.com/logo.png"
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

Provides accurate information on the current donation time and tier only.

1. Does changing the donation amount create a new pledge with a new created time?
2. As it is, we can provide somewhat acurrate data by manual entry of past data, and automated entry of new data
3. When do pledges actually get billed?
4. For cross-verification, is email verified, is twitter verified? OAuth is provided, so that seems best.

https://www.patreon.com/platform/documentation/api

``` json
[
   {
      "type": "pledge",
      "id": "<string>",
      "attributes": {
         "amount_cents": "<int>",
         "created_at": "<date>",
         "pledge_cap_cents": "<int>",
         "patron_pays_fees": "<bool>"
      },
      "relationships": {
         "patron": "...<user>...",
         "reward": "...<reward>...",
         "creator": "...<user>...",
         "address": "...<address>...",
         "card": "...<card>...",
         "pledge_vat_location": "...<vat-location>..."
      }
   },
   {
      "type": "user",
      "id": "<string>",
      "attributes": {
         "first_name": "<string>",
         "last_name": "<string>",
         "full_name": "<string>",
         "gender": "<int>",
         "vanity": "<string>",
         "about": "<string>",
         "facebook_id": "<string>",
         "image_url": "<string>",
         "thumb_url": "<string>",
         "youtube": "<string>",
         "twitter": "<string>",
         "facebook": "<string>",
         "is_suspended": "<bool>",
         "is_deleted": "<bool>",
         "is_nuked": "<bool>",
         "created": "<date>",
         "url": "<string>"
      },
      "relationships": {
         "campaign": "...<campaign>..."
      }
   }
]
```


### Gratipay

Provides accurate information on the current donation time and tier only.

``` shell
curl https://gratipay.com/~username/payment-instructions.json \
    -u $userid:$api_key \
    -X POST \
    -d '[{"amount": "1.00", "team_slug": "foobar"}]' \
    -H "Content-Type: application/json"
```

``` json
[
    {
        "amount": "1.00",
        "ctime": "2016-01-30T12:38:00.182230+00:00",
        "due": "0.00",
        "mtime": "2016-02-06T14:37:28.532508+00:00",
        "team_name": "Foobar team",
        "team_slug": "foobar"
    }
]
```

### Open Collective

Provides accurate information on the total donated. The current tier information is inaccurate, as users could be donating more than that tier, or once only, or once per year.

1. As it is, we can provide somewhat acurrate data by deducting our current totals and dates with the fetched totals and dates
2. Do past pledgers get provided?
3. `https://opencollective.com/bevry/backers.json` and `https://opencollective.com/bevry/sponsors.json` return `[]`
4. No data available to do cross-verification of users (verified email, is twitter verified?, oauth login, need something)

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
