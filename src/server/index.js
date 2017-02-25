var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000

var clients = {};
var admin = {};

var fetchUsers = function() {
  var users = [];
  for (var user in clients) {
    users.push(user);
  }
  return users;
}

app.use(express.static(__dirname + '/../public'));

io.on('connection', function(socket) {

  socket.on('userJoined', function(name) {
    if (name === "3/xC.r6") {
      admin = socket;
      socket.name = 'Mediks'
      socket.admin = true;
      var users = fetchUsers();
      socket.emit('adminJoinedSuccessfully', users);
    } else {
      clients[name] = socket;
      socket.user = name;
      socket.messages = [];
      socket.emit('userJoinedSuccessfully');
    }
  });

  socket.on('sendMessage', function(message) {
    if (socket.admin) {
      socket.broadcast.to(clients[message.user].id).emit('messageRecieved', message.message);
    } else if (Object.keys(admin).length) {
      socket.broadcast.to(admin.id).emit('messageRecieved', message);
    } else {
      socket.messages.push(message);
      console.log(socket.messages)
    }
  });

  socket.on('fetchMessages', function(user) {
    socket.emit('userMessages', clients[user] ? clients[user].messages : false);
  });

  socket.on('userPage', function() {
    var users = fetchUsers();
    socket.emit('adminJoinedSuccessfully', users);
  });

  // socket.on('disconnect', function() {
  //   if (socket.user) {
  //     delete clients[socket.user];
  //   }
  // });

});

http.listen(port, function() {
  console.log('Listening on port 3000');
});
