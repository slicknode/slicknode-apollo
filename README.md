# Slicknode Apollo

Apollo client with recommended defaults and built in authentication to work with
Slicknode GraphQL servers. 


## Installation

Install the client and required packages via npm:

    npm install slicknode-apollo graphql --save


## Usage

With the dependencies installed, you can create an instance of the ApolloClient with Slicknode
support enabled. You only need the endpoint of your Slicknode GraphQL server that you can
get via `slicknode endpoint` from your project. 

```javascript
import ApolloClient from 'slicknode-apollo';

const client = new ApolloClient({
  endpoint: 'https://myproject.slicknode.com'
});
```

This client is a regular ApolloClient instance with the data fetching logic for Slicknode
preconfigured. Authentication headers are automatically added, when the `accessToken` expires
and a query is fetched via the client, it is automatically refreshed in the background
without requiring any interruption to the user. 


## Authentication

You can use any of the available Authenticators to obtain a set of auth tokens and their expiration
times. We'll use the `slicknode-auth-email-password` authenticator as an example. For more details
check the documentation of the authenticators.

Always make sure that you have the module installed in your Slicknode server, otherwise the required
mutations are not available. 


### Example Email / Password

Install the dependencies via npm

    npm install slicknode-auth-email-password --save

Then in your application you can authenticate the user:

```javascript
import loginEmailPassword from 'slicknode-auth-email-password';

client.authenticate(loginEmailPassword('email@example.com', 'password123'))
    .then(() => {
      console.log('Login successful, redirect to user home page');
    })
    .catch(err => {
      console.log('Something went wrong, try again: ' + err.message);
    });
```

### Logout

To delete all the access and refresh tokens from the builtin token storage, simply log the user out:

```javascript
client.logout()
  .then(() => {
    console.log('Login successful');
  })
  .catch(err => {
    console.log('Something went wrong: ' + err.message);
  });
```

