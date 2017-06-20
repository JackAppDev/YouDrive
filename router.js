module.exports = function(checkAuth) {
  print = console.log
  //load dependencies
  const express = require('express'); //loads module used for server routing 
  const fs = require('fs-extra') //loads fs-extra - file related actions
  const path = require('path') //loads module for navigating the file system
  var router = express.Router() //defines router instance

  router.get('/login', function(req, res) {
    res.render('login')
  })

  router.get('/edit', checkAuth, function(req, res) {
    res.render('file', {
      name: req.session.name,
      path: req.session.filePath, 
      isMobile: req.session.isMobile,
      username: req.session.username
    })
  })

  router.get('/', checkAuth, function(req, res) {
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
  router.post('/login', checkAuth, function(req, res) {
    res.redirect('/')
  })
  router.post('/api', checkAuth, function (req, res) {
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
    req.body.isMobile = isMobile

    if (req.body.path) {
      req.body.path = req.body.path.split('|').join(path.sep)
    }
    
    function handlePossibleError(error) {
      if (error) res.send(error)
      else res.send()
    }
    if (req.files) {
      if (Object.keys(req.files) != []) {
        var file = req.files.file
        file.mv(path.join(rootPath, file.name), handlePossibleError) //move uploaded file to current directory
      }
    }
    switch (req.body.action) {
      case "listFiles":
        if (req.body.path) res.send(listFiles(req.session.username, path.normalize(req.body.path)))
        else res.send(listFiles(req.session.username))
        break
      case "downloadFile": //download file(s)
        delete req.body.action
        if (req.body.data) {
          //TODO: find a way to send file name
          res.zip({
            files: function() {
              for (element of req.body.data) {
                element.path = element.path.split("|").join(path.sep) //fix path to be cross-platform
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
        else
          fs.remove(req.body.path, handlePossibleError) //remove single folder
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
        req.body.path = req.body.path.split(path.sep).join('|')
        res.send()
        break
      case "saveFile": //save file
        delete req.body.action
        var p = path.join(path.resolve(req.body.path.split('|').join(path.sep)), req.body.name)
        fs.writeFile(p, req.body.file, function(error) {
          if (error) res.send(error)
          else res.send('success')
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

  function listFiles(username, directoryPath = __dirname) { //returns properties of files at path
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
  return router
}