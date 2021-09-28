// Dependencies
const express = require('express'); 
const dotenv = require('dotenv'); 
const morgan = require('morgan'); 
const colors = require('colors');
const jsforce = require('jsforce');
const cors = require('cors');

// Env Variables
dotenv.config({path: './config/config.env'});
const app = express();
const port = process.env.PORT || 3000;

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

// Routes
app.get('/', (req, res)=> {
    res.render('index')
})

app.get('/oauth2/auth', function(req, res) {
    const oauth2 = new jsforce.OAuth2({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET_ID,
      redirectUri: `${req.protocol}://${req.get('host')}/${process.env.REDIRECT_URI}`
    });
    res.redirect(oauth2.getAuthorizationUrl({}));
});

app.get('/form', (req, res) => {
    res.render('form')
})

app.get('/redirect', (req, res) => {
    const oauth2 = new jsforce.OAuth2({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET_ID,
        redirectUri: `${req.protocol}://${req.get('host')}/${process.env.REDIRECT_URI}`
      });
      const conn = new jsforce.Connection({ oauth2 : oauth2 });
      conn.authorize(req.query.code, function(err, userInfo) {
        if (err) {
          return console.error(err);
        }
        const conn2 = new jsforce.Connection({
          instanceUrl : conn.instanceUrl,
          accessToken : conn.accessToken
        });
        conn2.identity(function(err, res) {
          if (err) { return console.error(err); }
          console.log("user ID: " + res.user_id);
          console.log("organization ID: " + res.organization_id);
          console.log("username: " + res.username);
          console.log("display name: " + res.display_name);
        });
      });
      res.render('index');
})

// Server
app.listen(port, ()=>{
    console.log(colors.magenta(`Server is in ${process.env.NODE_ENV} mode and listening on port ${port}.`))
})