// Dependencies
const express = require('express'); 
const dotenv = require('dotenv'); 
const morgan = require('morgan'); 
const colors = require('colors');
const jsforce = require('jsforce');
const session = require('express-session');
const cors = require('cors');

// Env Variables
dotenv.config({path: './config/config.env'});
const app = express();
const port = process.env.PORT || 8080;

// Logger
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Middleware
app.use(express.json());   //replacement for body-parser
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');
app.use(cors())

// Use OAuth2 Login mechanism to retrieve access token
const oauth2 = new jsforce.OAuth2({
	loginUrl: process.env.SF_LOGIN_URL,
	clientId: process.env.SF_CLIENT_ID,
	clientSecret: process.env.SF_CLIENT_SECRET,
	redirectUri: process.env.REDIRECT_URI
});

// Enable server-side sessions
app.use(
	session({
		secret: process.env.sessionSecretKey,
		cookie: { secure: process.env.isHttps === 'true' },
		resave: false,
		saveUninitialized: false
	})
);

/**
 *  Attemps to retrieves the server session.
 *  If there is no session, redirects with HTTP 401 and an error message
 */
 function getSession(request, response) {
	const session = request.session;
	if (!session.sfdcAuth) {
		response.status(401).send('No active session');
		return null;
	}
	return session;
}

function resumeSalesforceConnection(session) {
  console.log(session.sfdcAuth.accessToken)
	return new jsforce.Connection({
		instanceUrl: session.sfdcAuth.instanceUrl,
		accessToken: session.sfdcAuth.accessToken,
		version: process.env.apiVersion
	});
}

// Routes

/**
 * Render splash page
 */
app.get('/', (req, res)=> {
  res.render('index')
})

/**
 * Login endpoint
 */
 app.get('/auth/login', function(request, response) {
	// Redirect to Salesforce login/authorization page
	response.redirect(oauth2.getAuthorizationUrl({ scope: 'api' }));
});

/**
 * Endpoint for retrieving currently connected user
 */
 app.get('/auth/whoami', function(request, response) {
	const session = getSession(request, response);
	if (session == null) {
		return;
	}

	// Request session info from Salesforce
	const conn = resumeSalesforceConnection(session);
	conn.identity(function(error, res) {
		response.send(res);
	});
});

/**
 * Logout endpoint
 */
 app.get('/auth/logout', function(request, response) {
	const session = getSession(request, response);
	if (session == null) return;

	// Revoke OAuth token
	const conn = resumeSalesforceConnection(session);
	conn.logout(function(error) {
		if (error) {
			console.error('Salesforce OAuth revoke error: ' + JSON.stringify(error));
			response.status(500).json(error);
			return;
		}

		// Destroy server-side session
		session.destroy(function(error) {
			if (error) {
				console.error('Salesforce session destruction error: ' + JSON.stringify(error));
			}
		});

		// Redirect to app main page
		return response.redirect('/');
	});
});

/**
 * Render the SFDC Speaker and Session Sign up details
 */
app.get('/form', (req, res) => {
  res.render('form')
})

/**
 * Login callback endpoint (only called by Salesforce)
 */
 app.get('/redirect', function(request, response) {
	if (!request.query.code) {
		response.status(500).send('Failed to get authorization code from server callback.');
		return;
	}

	// Authenticate with OAuth
	const conn = new jsforce.Connection({
		oauth2: oauth2,
		version: process.env.apiVersion
	});
	conn.authorize(request.query.code, function(error, userInfo) {
		if (error) {
			console.log('Salesforce authorization error: ' + JSON.stringify(error));
			response.status(500).json(error);
			return;
		}

		// Store oauth session data in server (never expose it directly to client)
		request.session.sfdcAuth = {
			instanceUrl: conn.instanceUrl,
			accessToken: conn.accessToken
		};
		
		// Redirect to app main page
		return response.redirect('/');
	});
});

// Server
app.listen(port, ()=>{
    console.log(colors.magenta(`Server is listening on port ${port}.`))
})