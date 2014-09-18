var connect = require('connect');
var serveStatic = require('serve-static');
var http = require('http');

var app = connect();
app.use(serveStatic(__dirname));
var server = http.createServer(app).listen(8080);

var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on('play-pause', function(){
    io.emit('play-pause');
  });
  socket.on('reset', function(){
    io.emit('reset');
  });
});
