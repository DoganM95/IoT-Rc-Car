var http = require('http').createServer(handler); //require http server, and create server with function handler()
let https = require('https').createServer(handler); //NEEDS FIX
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //https://www.npmjs.com/package/socket.io //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //https://www.npmjs.com/package/onoff#class-gpio //include onoff to interact with the GPIO
let pigpio = require('pigpio').Gpio; //https://www.npmjs.com/package/pigpio#servo-control //include pigpio to enable pulse width modulation for servo
let three = require("three"); //https://www.npmjs.com/package/three //

//GPIO Objects
let motor = new pigpio(4, {mode: pigpio.OUTPUT}); //use GPIO pin 4 as output
let servo = new pigpio(18, {mode: pigpio.OUTPUT});

//Reset Pins to low - Init
servo.servoWrite(1500);
motor.pwmWrite(0);

//Server
http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
  fs.readFile(__dirname + '/index.html', function(err, data) { //read file index.html in public folder
    if (err) { //error-handling
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      res.end("404 Not Found");
      return;
    }
    else { //just for readability
      res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
      res.write(data); //write data from index.html
      res.end();
      return;
    }
  });
}

//Server Socket listener
io.sockets.on('connection', function (socket) {// WebSocket Connection

  socket.on('motorSocket', (data) => { //when motorSocket receives data from client
    motor.pwmWrite(data); //set motor-speed
    socket.emit("motorSpeedSocket", motor.getPwmDutyCycle()); //emit motorSpeed to client-side to keep client updated about motors current speed
  });

  socket.on("servoSocket", (data) => {
    servo.servoWrite(data);
    socket.emit("servoAngleSocket", servo.getServoPulseWidth());
  });

});

//Event Listener
process.on('SIGINT', function () { //on ctrl+c
  motor.pwmWrite(0); // Turn motor off
  servo.servoWrite(1500); // center steering
  process.exit(); //exit completely
});