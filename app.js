/*
Jack ODonnell - 2017

This project is used for hosting an online file manager with a built in ide
To be accessed by any mobile/desktop os via any modern browser
Compatible with both Windows and macOS (hopefully)
*/

print = console.log

const express = require('express'); //loads module used for server routing 
const app = express()
const path = require('path') //defines main instance of express
const server = require('http').createServer(app)
const bodyParser = require('body-parser') //allows for reading request parameters
const fileUpload = require('express-fileupload') //allows for capturing uploaded files
const device = require('express-device') //loads module for finding device type
const zip = require('express-easy-zip') //easily zip and send files/folders
const session = require('express-session') 
const FileStore = require('session-file-store')(session)
const io = require('./io')(server)
const db = require('./db');

app.set('view options', {layout: false}) //detect screen size? I actually dont know
app.use(session({
  store: new FileStore({
    reapInterval: 1500
    //secret: "sshItsASecret" //encrypts session files
  }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}))
app.use(device.capture()) //finds device type
app.use(zip()) //allows file zipping
app.use(fileUpload()) //allow uploading files
app.use('/file', express.static(path.join(__dirname, 'public'))) //allow use of files in '/public'
app.use('/codemirror', express.static(path.join(__dirname, 'node_modules', 'codemirror'))) //allow use of files in '/node_modules/codemirror'
app.set('views', './views') //set views directory
app.set('view engine', 'pug') //set view engine (.pug)
app.set('port', process.env.PORT || 3000); //set port
app.set('host', process.env.HOST || "0.0.0.0"); //set ip

var router = require('./router')(function(req, res, next) { //gets called before carrying out any request
  db.query('SELECT * FROM public.user WHERE username = $1 AND password = $2', [
    req.body.username || req.session.username,
    req.body.password || req.session.password], 
  function(err, result) {
    if (err) {
      return print('error running query', err)
    }
    if (result.rows[0]) {
      function check(values) {
        values.forEach(function(value) {
          if (req.body[value]) req.session[value] = req.body[value]
        })
      }
      check([
        'username',
        'password',
        'path', 
        'filePath', 
        'isMobile',
        'name'
      ])
      
      if (req.session.path) 
        req.session.path = req.session.path.split(path.sep).join("|")
      next()
    }
    else {
      print('failed, ip =', req.ip)
      res.redirect('/login')
    }
  })
})

app.use('/', router) //use all requests defined above
//launch server
server.listen(app.get('port'), app.get('host'), function() {
  var host = server.address().address
  var port = server.address().port
  print(`running at ${host}:${port}`)
});

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', function() {
  process.exit() //actually kill server
});

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', function() {
  process.exit() //actually kill server
});