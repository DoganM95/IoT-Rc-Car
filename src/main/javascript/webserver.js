let http = require("http").createServer(httpHandler); //require http server, and create server with function handler()
let https = require("https").createServer(httpHandler); //NEEDS FIX
let fs = require("fs"); //require filesystem module
let io = require("socket.io")(http); //https://www.npmjs.com/package/socket.io //require socket.io module and pass the http object (server)
let gpio = require("onoff").Gpio; //https://www.npmjs.com/package/onoff#class-gpio //include onoff to interact with the GPIO
let pigpio = require("pigpio").Gpio; //https://www.npmjs.com/package/pigpio#servo-control //include pigpio to enable pulse width modulation for servo
let three = require("three"); //https://www.npmjs.com/package/three //

//-----------------------------------------------------------------------------
//Variables
//-----------------------------------------------------------------------------
//GPIO Objects
let motorLeft = new pigpio(4, {
  mode: pigpio.OUTPUT
}); //use GPIO pin 4 as output
let motorRight = new pigpio(4, {
  mode: pigpio.OUTPUT
}); //use GPIO pin 4 as output

let servoLeft = new pigpio(23, { mode: pigpio.OUTPUT });
let servoRight = new pigpio(24, { mode: pigpio.OUTPUT });

let engineLeft = {
  forward: new gpio(26, { mode: pigpio.OUTPUT }),
  backward: new gpio(19, { mode: pigpio.OUTPUT }),
  speed: new pigpio(21, { mode: pigpio.OUTPUT }),
  setForward: function() {
    engineLeft.forward.writeSync(1);
    engineLeft.backward.writeSync(0);
  },
  setBackward: function() {
    engineLeft.forward.writeSync(0);
    engineLeft.backward.writeSync(1);
  },
  setSpeed: function() {
    this.speed.pwmWrite();
  }
};
let engineRight = {
  forward: new gpio(13, { mode: pigpio.OUTPUT }),
  backward: new gpio(6, { mode: pigpio.OUTPUT }),
  setForward: function() {
    engineRight.forward.writeSync(1);
    engineRight.backward.writeSync(0);
  },
  setBackward: function() {
    engineRight.forward.writeSync(0);
    engineRight.backward.writeSync(1);
  }
};

let client;

const steering = {
  leftServo: servoLeft,
  rightServo: servoRight,

  writeServos(rotation) {
    Object.keys(this).forEach(servo => {
      if (rotation > 2500) {
        servo.servoWrite(2500);
      } else if (rotation < 500) {
        servo.servoWrite(500);
      } else {
        servo.servoWrite(rotation);
      }
    });
  }
};

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------

servoLeft.servoWrite(1500);
servoRight.servoWrite(1500);

//Server Socket listener
io.sockets.on("connection", function(socket) {
  console.log("connection established!");

  // socket.on("connection", identityObject => {
  //   client = identityObject;
  // });

  socket.on("motorLeftSocket", data => {
    //when motorLeftSocket receives data from client
    motorLeft.pwmWrite(data); //set motorLeft-speed
    socket.emit("motorLeftSpeedSocket", motorLeft.getPwmDutyCycle()); //emit motorLeftSpeed to client-side to keep client updated about motorLefts current speed
  });

  socket.on("servoSocket", data => {
    //entry point for servo writes

    //TODO: place algorithm here to sync servo angles
    steering.leftServo.servoWrite(data);
    steering.rightServo.servoWrite(data);

    socket.emit("leftServoAngleSocket", steering.leftServo.getServoPulseWidth());
    socket.emit("rightServoAngleSocket", steering.rightServo.getServoPulseWidth());
  });

  // motorLeft.pwmRange(30);
});

//Server
http.listen(8080); //listen to port 8080
console.log("waiting for connection on web-interface.");

//Event Listener
process.on("SIGINT", function() {
  //on ctrl+c
  console.log("killing server.");
  motorLeft.pwmWrite(0); // Turn motorLeft off
  steering.leftServo.servoWrite(1500);
  steering.rightServo.servoWrite(1500); // center steering
  process.exit(); //exit completely
});

//-----------------------------------------------------------------------------
//Functions
//-----------------------------------------------------------------------------
function httpHandler(req, res) {
  //create server
  fs.readFile(__dirname + "/index.html", function(err, data) {
    //read file index.html in public folder
    if (!err) {
      res.writeHead(200, { "Content-Type": "text/html" }); //write HTML
      res.write(data); //write data from index.html
      res.end();
      return;
    } else {
      res.writeHead(404, { "Content-Type": "text/html" }); //display 404 on error
      res.end("404 Not Found");
      return;
    }
  });
}
