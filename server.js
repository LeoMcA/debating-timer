var connect = require('connect');
var serveStatic = require('serve-static');
var http = require('http');

var app = connect();
app.use(serveStatic(__dirname));
var server = http.createServer(app).listen(8000);

var events = require('events');
var eventEmitter = new events.EventEmitter();

var websocket = require('websocket').server;

remoteServer = new websocket({
  httpServer: http.createServer().listen(8881)
});

remoteServer.on('request', function(request){
  var connection = request.accept('remote-protocol', request.origin);
  console.log('remote connection accepted');

  connection.on('message', function(msg){
    console.log(msg.utf8Data);
    eventEmitter.emit('message', msg.utf8Data);
  });
});

timerServer = new websocket({
  httpServer: http.createServer().listen(8882)
});

timerServer.on('request', function(request){
  var connection = request.accept('timer-protocol', request.origin);
  console.log('timer connection accepted');

  eventEmitter.on('message', function(msg){
    connection.sendUTF(msg);
  });

});
