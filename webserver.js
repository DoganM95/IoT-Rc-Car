var http = require('http').createServer(handler); //require http server, and create server with function handler()
let https = require('https').createServer(handler); //NEEDS FIX
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //https://www.npmjs.com/package/socket.io //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //https://www.npmjs.com/package/onoff#class-gpio //include onoff to interact with the GPIO
let pigpio = require('pigpio').Gpio; //https://www.npmjs.com/package/pigpio#servo-control // include pigpio to enable pulse width modulation for servo

//GPIO Objects
let motor = new Gpio(4, 'out'); //use GPIO pin 4 as output
// let servo = new Gpio(18, 'out'); //use GPIO pin 4 as output
let servo = new pigpio(18, {mode: pigpio.OUTPUT});

//Reset Pins to low - Init
servo.servoWrite(0);

//Server
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
  });
  socket.on("servoSocket", function(data){
    servo.writeSync(data);
  })
});

//Event Listener
process.on('SIGINT', function () { //on ctrl+c
  motor.writeSync(0); // Turn LED off
  motor.unexport(); // Unexport LED GPIO to free resources
  servo.writeSync(0); // Turn LED off
  servo.unexport(); // Unexport LED GPIO to free resources
  process.exit(); //exit completely
});