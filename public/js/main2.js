const dotenv = require('dotenv');
const jsforce = require('jsforce');
const passwordString = `${process.env.SF_PASSWORD}${process.env.SF_TOKEN}`

// Env Variables
dotenv.config({path: './config/config.env'});

// OAuth2 Credentials
const oauth = {
  loginUrl : process.env.SF_LOGIN_URL,
  clientId : process.env.SF_CLIENT_ID,
  clientSecret : process.env.SF_CLIENT_SECRET,
  redirectUri : process.env.REDIRECT_URI
}

var conn = new jsforce.Connection({
  oauth2 : oauth,
  version: process.env.apiVersion
});

var conn = new jsforce.Connection({
  oauth2 : {
    clientId : process.env.SF_CLIENT_ID,,
    clientSecret : process.env.SF_CLIENT_SECRET,
    redirectUri : process.env.REDIRECT_URI
  },
  instanceUrl : process.env.SF_BASE_URI,
  accessToken : '<your Salesforrce OAuth2 access token is here>',
  refreshToken : '<your Salesforce OAuth2 refresh token is here>'
});
conn.on("refresh", function(accessToken, res) {
  // Refresh event will be fired when renewed access token
  // to store it in your storage for next request
});

// Alternatively, you can use the callback style request to fetch the refresh token
conn.oauth2.refreshToken(refreshToken, (err, results) => {
  if (err) return reject(err);
  resolve(results);
});