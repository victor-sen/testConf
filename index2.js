const express = require('express')
const dotenv = require('dotenv')
const jsforce = require('jsforce')
const path = require('path')
const session = require('express-session')
const morgan = require('morgan'); 
const cors = require('cors')
const app = express();

// configure env variables
dotenv.config({path: '../config/config.env'});

// Logger
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Middleware
app.use(express.json());   //replacement for body-parser
app.use('/', express.static(path.join(__dirname, '../public')));
app.use('/', express.static(path.join(__dirname, '../views')));
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
	return new jsforce.Connection({
		instanceUrl: session.sfdcAuth.instanceUrl,
		accessToken: session.sfdcAuth.accessToken,
		version: process.env.apiVersion
	});
}

/**
 * Login endpoint
 */
 app.get('/auth/login', function(request, response) {
	// Redirect to Salesforce login/authorization page
	response.redirect(oauth2.getAuthorizationUrl({ scope: 'api' }));
});

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
		return response.redirect('/index.html');
	});
});

app.get('/form', (req, res) => {
    res.redirect('/form.html');
})

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
		return response.redirect('/index.html');
	});
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
 * Endpoint for performing a SOQL query on Salesforce
 */
 app.get('/query', function(request, response) {
	const session = getSession(request, response);
	if (session == null) {
		return;
	}

	const query = request.query.q;
	if (!query) {
		response.status(400).send('Missing query parameter.');
		return;
	}

	const conn = resumeSalesforceConnection(session);
	conn.query(query, function(error, result) {
		if (error) {
			console.error('Salesforce data API error: ' + JSON.stringify(error));
			response.status(500).json(error);
			return;
		} else {
			response.send(result);
			return;
		}
	});
});

app.listen(process.env.PORT, () => console.log(`Server is up and listening on ${process.env.PORT}`))