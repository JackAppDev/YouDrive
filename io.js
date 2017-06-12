print = console.log

const fs = require('fs-extra')
const path = require('path')
const saveDelay = 4000

const init = function(server) {
  const io = require('socket.io')(server)
  var files = {}
  io.sockets.on('connection', function(socket) {
    function setSave(op) {
      return setTimeout(function() {
        fs.writeFile(op.path.split("|").join(path.sep), (files[op.path]) ? files[op.path].body : op.body, function(error) {
          if (error) print(error)
          else (files[op.path]) ? files[op.path].edited : _ = Date.now()
        })
      }, saveDelay)
    }
    socket.on('init', function(op) {
      print(files)
      if (files[op.path] == undefined) {
        var body = fs.readFileSync(op.path.split("|").join(path.sep))
        socket.emit('refresh', {
          body: body.toString()
        })
        files[op.path] = {
          sockets: [socket],
          body: body,
          edited: Date.now(),
          save: setSave(op),
          cancelSave: function() {
            clearTimeout(this.save)
          }
        }
      }
      else {
        var body = fs.readFileSync(op.path.split("|").join(path.sep))
        socket.emit('refresh', {
          body: body.toString()
        })
      }
      if (!files[op.path].sockets.includes(socket))
        files[op.path].sockets.push(socket)
    })

    socket.on('change', function (op) {
      if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete') {
        files[op.path].sockets.forEach(function(sock) {
          if (sock != socket)
            sock.emit('change', op)
        })
        if (Date.now() - files[op.path].edited < saveDelay) {
          files[op.path].cancelSave()
        }
      }
    })

    socket.on('refresh', function (op) {
      files[op.path].body = op.body
      files[op.path].cancelSave()
      files[op.path].save = setSave(op)
    })

    socket.on('deinit', function(data) {
      if (files[data.path]) {      
        var index = files[data.path].sockets.indexOf(socket);
        if (index > -1)
          files[data.path].sockets.splice(index, 1);
        if (files[data.path].sockets.length == 0)
          delete files[data.path]
      }
    })
  })
}

module.exports = {
  init: init
}
