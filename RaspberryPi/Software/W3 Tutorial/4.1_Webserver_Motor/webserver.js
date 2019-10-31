var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

//GPIO Objects
var motor = new Gpio(4, 'out'); //use GPIO pin 4 as output

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
  fs.readFile(__dirname + '/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    res.end();
    return;
  });
}

//Server Socket listener
io.sockets.on('connection', function (socket) {// WebSocket Connection
  socket.on('motorSocket', (data) => {
    motor.writeSync(data);
  })
});

//Event Listener
process.on('SIGINT', function () { //on ctrl+c
  motor.writeSync(0); // Turn LED off
  motor.unexport(); // Unexport LED GPIO to free resources
  process.exit(); //exit completely
});