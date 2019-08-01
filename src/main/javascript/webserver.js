let http = require("http").createServer(handler); //require http server, and create server with function handler()
let https = require("https").createServer(handler); //NEEDS FIX
let fs = require("fs"); //require filesystem module
let io = require("socket.io")(http); //https://www.npmjs.com/package/socket.io //require socket.io module and pass the http object (server)
let Gpio = require("onoff").Gpio; //https://www.npmjs.com/package/onoff#class-gpio //include onoff to interact with the GPIO
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

let servoLeft = new pigpio(23, {
  mode: pigpio.OUTPUT
});
let servoRight = new pigpio(24, {
  mode: pigpio.OUTPUT
});

let engineLeftSpeed = new pigpio(17, {
  mode: pigpio.OUTPUT
});
let engineRightSpeed = new pigpio(16, {
  mode: pigpio.OUTPUT
});

let motors = [motorLeft, motorRight]; //Control all motors at once
let servos = [servoLeft, servoRight]; //Control all servos at once

let client;

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------

// (async () => {
//   let i = 0;
//   while (true) {
//     setTimeout(function() {
//       console.log(i);
//       i++;
//     }, 1);
//   }
// '
//Reset Pins to low - Init
// servos.writeServosProto();
// steering.writeServos(1500);
servoLeft.servoWrite(1500);
servoRight.servoWrite(1500);
motorLeft.pwmWrite(0);

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

    socket.emit(
      "leftServoAngleSocket",
      steering.leftServo.getServoPulseWidth()
    );
    socket.emit(
      "rightServoAngleSocket",
      steering.rightServo.getServoPulseWidth()
    );
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

// })();

//-----------------------------------------------------------------------------
//Objects
//-----------------------------------------------------------------------------
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

const engine = {
  leftMotor: motorLeft,
  rightMotor: motorRight,

  writeMotors(speed) {
    Object.values /
      this.forEach(motor => {
        if (speed > 100) {
          motor.pwmWrite(100);
        } else if (speed < 0) {
          motor.pwmWrite(0);
        } else {
          motor.pwmWrite(speed);
        }
      });
  }
};

//-----------------------------------------------------------------------------
//METHODS
//-----------------------------------------------------------------------------
Array.prototype.writeMotorsProto = function(speed) {
  this.forEach(motor => {
    if (speed > 100) {
      motor.pwmWrite(100);
    } else if (speed < 0) {
      motor.pwmWrite(0);
    } else {
      motor.pwmWrite(speed);
    }
  });
};

Array.prototype.writeServosProto = function(steering) {
  this.forEach(servo => {
    if (steering > 2500) {
      servo.servoWrite(2500);
    } else if (steering < 500) {
      servo.servoWrite(500);
    } else {
      servo.servoWrite(steering);
    }
  });
};

//-----------------------------------------------------------------------------
//Functions
//-----------------------------------------------------------------------------
function handler(req, res) {
  //create server
  fs.readFile(__dirname + "/index.html", function(err, data) {
    //read file index.html in public folder
    if (err) {
      //error-handling
      res.writeHead(404, {
        "Content-Type": "text/html"
      }); //display 404 on error
      res.end("404 Not Found");
      return;
    } else {
      //just for readability
      res.writeHead(200, {
        "Content-Type": "text/html"
      }); //write HTML
      res.write(data); //write data from index.html
      res.end();
      return;
    }
  });
}
