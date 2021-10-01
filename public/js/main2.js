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

// conn.login(process.env.SF_USERNAME, passwordString, function(err, userInfo) {
//   if (err) { return console.error(err); }
//   console.log(conn.accessToken);
//   console.log(conn.instanceUrl);
//   console.log("User ID: " + userInfo.id);
//   console.log("Org ID: " + userInfo.organizationId);
// });

console.log(conn);