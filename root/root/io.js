

const path = require('path')
const init = function(server) {
  const io = require('socket.io')(ser
  io.sockets.on('connection', function (socket) {
    socks.push(socket)
    socket.emit('refresh', {body: body})
         
    socket.on('refresh', function (body_) {
      body = body_
    });
    
    socket.on('change', function (op) {
      // console.log(op);
      if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete') {
        socks.forEach(function (sock) {
          if (sock != socket) {
            sock.emit('change', op)
          }
          else {
            print(op.username, op.path)
            
          }
        })
      }
    })
  })
}

module.exports = {
  init: init
}
