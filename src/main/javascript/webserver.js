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
let steering = {
  leftServo: new pigpio(23, { mode: pigpio.OUTPUT }),
  rightServo: new pigpio(24, { mode: pigpio.OUTPUT }),
  setDirection: function(angle) {
    //Syncing algorithm comes here
    this.leftServo.servoWrite(angle);
    this.rightServo.servoWrite(angle);
  }
};

let engineLeft = {
  forward: new gpio(26, {
    mode: pigpio.OUTPUT
  }),
  backward: new gpio(19, {
    mode: pigpio.OUTPUT
  }),
  speed: new pigpio(21, {
    mode: pigpio.OUTPUT
  }),
  setForward: function() {
    engineLeft.forward.writeSync(1);
    engineLeft.backward.writeSync(0);
  },
  setBackward: function() {
    engineLeft.forward.writeSync(0);
    engineLeft.backward.writeSync(1);
  },
  setSpeed: function(speed) {
    this.speed.pwmWrite(speed);
  }
};
let engineRight = {
  forward: new gpio(13, {
    mode: pigpio.OUTPUT
  }),
  backward: new gpio(6, {
    mode: pigpio.OUTPUT
  }),
  setForward: function() {
    engineRight.forward.writeSync(1);
    engineRight.backward.writeSync(0);
  },
  setBackward: function() {
    engineRight.forward.writeSync(0);
    engineRight.backward.writeSync(1);
  }
};

let clients = [];

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

//Server Socket listener
io.sockets.on("connection", function(socket) {
  console.log(
    "connection established from " +
      socket.client.conn.remoteAddress +
      " - " +
      new Date().toUTCString()
  );
  clients.pop();
  clients.push(socket.client);

  socket.on("engineLeftSocket", data => {});
  socket.on("engineRightSocket", data => {});

  socket.on("servoSocket", data => {
    //TODO: place algorithm here to sync servo angles
    steering.setDirection(data);

    socket.emit(
      "steeringSocket",
      (steering.leftServo.getServoPulseWidth() + steering.rightServo.getServoPulseWidth()) / 2
    );
  });
});

//Server
http.listen(8080); //listen to port 8080
console.log("waiting for connection on web-interface.");

//Event Listener
process.on("SIGINT", function() {
  //on ctrl+c
  console.log("killing server.");
  motorLeft.pwmWrite(0); // Turn motorLeft off
  steering.setDirection(1500);
  process.exit(); //exit completely
});

//-----------------------------------------------------------------------------
//Functions
//-----------------------------------------------------------------------------
function httpHandler(req, res) {
  fs.readFile(__dirname + "/index.html", function(err, data) {
    if (!err) {
      res.writeHead(200, {
        "Content-Type": "text/html"
      }); //write HTML
      res.write(data); //write data from index.html
      res.end();
      return;
    } else {
      res.writeHead(404, {
        "Content-Type": "text/html"
      }); //display 404 on error
      res.end("404 Not Found");
      return;
    }
  });
}
