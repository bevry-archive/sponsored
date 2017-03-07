# Install

## Firebase

Create a firebase project.

Grab the admin credentials

https://console.firebase.google.com/project/sponsored-66892/settings/serviceaccounts/adminsdk

Optionally, setup a user with all the correct permissions and use that insteaD:

https://console.firebase.google.com/project/sponsored-66892/authentication/users


## Patreon

Create an API app and grab your credentials.

https://www.patreon.com/platform/documentation/clients


## Auth0

As account linking is a paid Auth0 feature, instead we will move to Firebase Authentication.

### Basic Setup

https://manage.auth0.com/#/clients

Create a Single Page Web App. Search for `Node.js` for the stack.

https://manage.auth0.com/#/rules/new

Enable `Force email verification` rule.

### Patreon Setup

https://manage.auth0.com/#/extensions

Enable `Custom Social Connections`. Add Patreon connection:

- Name: `Patreon`
- Client ID: the one from patreon
- Client Secret: the one from patreon
- Authorization URL: `https://www.patreon.com/oauth2/authorize`
- Token URL: `https://api.patreon.com/oauth2/token`
- Scope: `public`
- Fetch User Profile Script:

  ``` javascript
  function(accessToken, ctx, cb) {
    request.get(
      'https://api.patreon.com/oauth2/api/current_user', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      },
      function(e, r, b) {
        if (e) return cb(e);
        if (r.statusCode !== 200) return cb(new Error('StatusCode: ' + r.statusCode));
        var profile = JSON.parse(b);
        cb(null, profile);
      }
    )
  }
  ```


### Open Collective Setup

https://manage.auth0.com/#/connections/social

- Enable Twitter
- Enable GitHub (enable `email address`)

### PayPal Setup

https://manage.auth0.com/#/connections/social

- Enable PayPal