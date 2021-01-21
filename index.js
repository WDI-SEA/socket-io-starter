const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const app = express();
const port = process.env.PORT || 3000;

// We have to use the http module when using Socket.io because
// it requires a bit more access to server guts than a regular
// Express app provides us with.
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(ejsLayouts);

app.get('/', (req, res) => {
  res.render('index');
});

// Keep track of votes for the left and right boxes.
// These are global variables that persist once in the
// memory of the one running server. These values will
// reset every time the server restarts.
let leftVotes = 0;
let rightVotes = 0;

// 'io' listens for new connections.
// each new connection comes with it's own socket which represents
// a unique client.
io.on('connection', socket => {
  console.log('a user connected');

  // 'disconnect' is an event sockets produce automatically.
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // 'right-vote' and 'left-vote' are events we create manually
  // from the client.
  socket.on('right-vote', msg => {
    console.log("got right vote");
    rightVotes++;
    emitVotes();
  });

  socket.on('left-vote', msg => {
    console.log("got left vote");
    leftVotes++;
    emitVotes();
  });

  // this function emits our custom 'vote-count' event to all of
  // the sockets. All of the clients will instantly receive the
  // updated count of all the votes.
  const  emitVotes = () => {
    let votes = {left: leftVotes, right: rightVotes};
    io.emit('vote-count', votes);
  }

  // When the server receives our custom 'send-chat' event it simply
  // emits the message globally to all of the other sockets.
  socket.on('send-chat', msg => {
    console.log(msg);
    io.emit('receive-chat', msg)
  });

});

console.log("localhost: " + port);
http.listen(port);
