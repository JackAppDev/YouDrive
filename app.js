/*
Jack ODonnell - 2017

This project is used for hosting an online file manager with a built in ide
To be accessed by any mobile/desktop os via any modern browser
Compatible with both Windows and macOS (hopefully)
*/

//define global values
print = console.log //print() > console.log()
var rootPath;
//Allowed users
var users = {
  "root" : "sparky",
  "jack" : "sparky"
}

//load dependencies
const express = require('express'); //loads module used for server routing 
const app = express() //defines main instance of express
const server = require('http').createServer(app)
const fs = require('fs-extra') //loads fs-extra - file related actions
const path = require('path') //loads module for navigating the file system
const router = express.Router() //defines router instance
const bodyParser = require('body-parser') //allows for reading request parameters
const fileUpload = require('express-fileupload') //allows for capturing uploaded files
const exec = require('child_process').exec //allows executing files
const device = require('express-device') //loads module for finding device type
const zip = require('express-easy-zip') //easily zip and send files/folders
const session = require('express-session') 
const FileStore = require('session-file-store')(session)

const io = require('./io')
io.init(server)

app.set('view options', {layout: false}) //detect screen size? I actually dont know
//inits session saving
app.use(session({
  store: new FileStore({
    reapInterval: 1500 //how often to delete expired sessions
    //secret: "sshItsASecret" //encrypts session files
  }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}))
app.use(device.capture()) //finds device type
app.use(zip()) //allows file zipping
app.use(fileUpload()) //allow uploading files
app.use('/file', express.static(path.join(__dirname, 'public'))) //allow use of files in '/public'
app.use('/codemirror', express.static(path.join(__dirname, 'node_modules', 'codemirror'))) //allow use of files in '/node_modules/codemirror'

app.set('views', './views') //set views directory
app.set('view engine', 'pug') //set view engine (.pug)
//define network info
app.set('port', process.env.PORT || 3000); //set port
app.set('host', process.env.HOST || "0.0.0.0"); //set ip

router.get('/login', function(req, res) {
  res.render('login')
})
const db = require('./db');
//middleware for authentification
function checkAuth(req, res, next) { //gets called before carrying out any request
  db.query(`
    SELECT username
    FROM public.user
    WHERE 
      username = '${req.body.username || req.session.username}' AND 
      password = '${req.body.password || req.session.password}';`, 
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
}

router.get('/edit', checkAuth, function(req, res) {
  res.render('file', {
    name: req.session.name,
    path: req.session.filePath, 
    isMobile: req.session.isMobile,
    username: req.session.username
  })
})

//main page routing
router.get('/', checkAuth, function(req, res) {
  //desktop, tv, tablet, phone, bot or car
  var isMobile;
  switch (req.device.type) {
    case "phone":
    case "tablet":
      isMobile = true
      break
    default:
      isMobile = false
      break
  }
  if (req.session.path) {
    res.render('home', {
      isMobile: isMobile,
      path: req.session.path
    })
  }
  else {
    res.render('home', {
      isMobile: isMobile
    })
  }
})

//after login, set url to domain
router.post('/login', checkAuth, function(req, res) {
  res.redirect('/')
})
//handle all api requests
router.post('/api', checkAuth, function (req, res) {
  var isMobile;
  //decide device type
  switch (req.device.type) {
    case "phone":
    case "tablet":
      isMobile = true
      break
    default:
      isMobile = false
      break
  }
  req.body.isMobile = isMobile

  if (req.body.path) {
    req.body.path = req.body.path.split('|').join(path.sep)
  }
  
  //error handling function
  function handlePossibleError(error) {
    if (error) {
      print(error)
      res.send(error)
    }
    else {
      res.send()
    }
  }
  //file is uploaded
  if (req.files != undefined) {
    if (Object.keys(req.files) != []) {
      //file uploaded
      var file = req.files.file
      file.mv(path.join(rootPath, file.name), handlePossibleError) //move uploaded file to current directory
    }
  }
  //all other api requests
  switch (req.body.action) {
    case "listFiles": //return file names in directory
      if (req.body.path)
        res.send(listFiles(req.session.username, path.normalize(req.body.path)))
      else 
        res.send(listFiles(req.session.username))
      break
    case "downloadFile": //download file(s)
      delete req.body.action
      if (req.body.data) {
        //TODO: find a way to send file name
        res.zip({
          files: function() {
            for (let i in req.body.data) {
              req.body.data[i].path = req.body.data[i].path.split("|").join(path.sep) //fix path to be cross-platform
            }
            return req.body.data //return correct path
          }(), 
          filename: (req.body.name) ? req.body.name + ".zip" : "archive.zip"
        });
      }
      break
    case "deleteFile": //delete file
      delete req.body.action
      fs.unlink(req.body.path, handlePossibleError) //actually delete the file
      break
    case "deleteDirectory": //delete folder(s)
      delete req.body.action
      if (req.body.paths) {
        req.body.paths.forEach(function(p) { //remove each folder
          fs.remove(p, handlePossibleError)
        })
      }
      else {
        fs.remove(req.body.path, handlePossibleError) //remove single folder
      }
    case "rename": //rename file/folder
      delete req.body.action
      fs.rename(req.body.path, req.body.name, handlePossibleError)
      break
    case "newFolder": //create new folder
      delete req.body.action
      fs.mkdir(path.join(req.body.path, req.body.name), handlePossibleError)
      break
    case "openFile": //send file contents
      delete req.body.action
      res.send(fs.readFileSync(req.body.path))
    case "editFile": //send editor page for file
      delete req.body.action
      // req.body.username = req.session.username
      // req.body.code = `${fs.readFileSync(path.join(req.body.path, req.body.name))}`
	    req.body.path = req.body.path.split(path.sep).join('|')
      //res.render('file', req.body)
      res.send()
      break
    case "saveFile": //save file
      delete req.body.action
	    var p = path.join(path.resolve(req.body.path.split('|').join(path.sep)), req.body.name)
      fs.writeFile(p, req.body.file, function(error) {
        if (error) {
          print(error)
          res.send(error)
        }
        else {
          print('saved')
          res.send('success')
        }
      })
      break
    case "move": //rename file to move
      delete req.body.action
      fs.rename(req.body.from, req.body.to, handlePossibleError)
      break
    default:
      break
  }
});

app.use('/', router) //use all requests defined above
//launch server
server.listen(app.get('port'), app.get('host'), function() {
  print('Jack\'s File Server')
  var host = server.address().address
  var port = server.address().port
  print(`running at ${host}:${port}`)
});

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', function() {
  print('term')
  process.exit() //actually kill server
});

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', function() {
  var msg = 'Shutting down'
  print(msg)
  process.exit() //actually kill server
});

function listFiles(username, directoryPath) { //returns properties of files at path
  if (directoryPath) {
    rootPath = directoryPath
    var files = fs.readdirSync(directoryPath) //file names
    return {
      files: files.map(function(fileName) { //go through each filename
        var filePath = path.join(directoryPath, fileName)
        var data = fs.statSync(filePath) //file data
        return {
          name: fileName,
          path: filePath,
          size: data.size,
          type: path.extname(fileName),
          created: data.birthtime,
          isFile: data.isFile(),
          isDirectory: data.isDirectory()
        }
      }),
      path: directoryPath
    }
  }
  else {
    return listFiles(username, path.join("root", username)) //default path
  }
}
