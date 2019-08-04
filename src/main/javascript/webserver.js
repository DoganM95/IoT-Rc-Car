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
let clients = [];
let clientAxisLimits;
let angle;

let steering = {
  leftServo: new pigpio(23, { mode: pigpio.OUTPUT }),
  rightServo: new pigpio(24, { mode: pigpio.OUTPUT }),
  setDirection: function(angle) {
    //Syncing algorithm comes here
    this.leftServo.servoWrite(angle);
    this.rightServo.servoWrite(angle);
  }
};

let engine = {
  leftMotor: {
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
  },
  rightMotor: {
    forward: new gpio(13, {
      mode: pigpio.OUTPUT
    }),
    backward: new gpio(6, {
      mode: pigpio.OUTPUT
    }),
    speed: new pigpio(20, {
      mode: pigpio.OUTPUT
    }),
    setForward: function() {
      engineRight.forward.writeSync(1);
      engineRight.backward.writeSync(0);
    },
    setBackward: function() {
      engineRight.forward.writeSync(0);
      engineRight.backward.writeSync(1);
    },
    setSpeed: function(speed) {
      this.speed.pwmWrite(speed);
    }
  },
  bothMotors: {
    setForward: function() {
      engineRight.forward.writeSync(1);
      engineLeft.forward.writeSync(1);
      engineRight.backward.writeSync(0);
      engineLeft.backward.writeSync(0);
    },
    setBackward: function() {
      engineLeft.forward.writeSync(0);
      engineRight.forward.writeSync(0);
      engineRight.backward.writeSync(1);
      engineLeft.backward.writeSync(1);
    },
    setSpeed: function(speed) {
      engine.leftMotor.setSpeed(speed);
      engine.rightMotor.setSpeed(speed);
    },
    setPwmFrequency: function(hertz) {
      engine.leftMotor.speed.pwmFrequency(hertz);
      engine.rightMotor.speed.pwmFrequency(hertz);
    }
  },
  avgMotor: {
    getSpeed: function() {
      return (engine.leftMotor.speed.getPwmDutyCycle() + engine.rightMotor.speed.getPwmDutyCycle()) / 2;
    },
    getSpeed: function() {
      return (engine.leftMotor.speed.getPwmDutyCycle() + engine.rightMotor.speed.getPwmDutyCycle()) / 2;
    },
    getPwmFrequency: function() {
      return (engine.leftMotor.speed.getPwmFrequency() + engine.rightMotor.speed.getPwmFrequency()) / 2;
    },
    getPwmRange: function() {
      return (engine.leftMotor.speed.getPwmRange() + engine.rightMotor.speed.getPwmRange()) / 2;
    }
  }
};

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------
(async () => {
  engine.bothMotors.setPwmFrequency(5000);
  console.log("pwm range of left engine: " + engine.leftMotor.speed.getPwmRange());
  console.log("pwm range of right engine: " + engine.rightMotor.speed.getPwmRange());
  console.log("pwm freq of left engine: " + engine.leftMotor.speed.getPwmFrequency());
  console.log("pwm freq of right engine: " + engine.rightMotor.speed.getPwmFrequency());

  //Server Socket listener
  io.sockets.on("connection", function(socket) {
    console.log("connection established from " + socket.client.conn.remoteAddress + " - " + new Date().toUTCString());
    try {
      clients.pop().conn.removeAllListeners();
    } catch (e) {
      console.log("no client to pop!");
    }
    clients.push(socket.client);

    socket.on("axisLimits", data => {
      clientAxisLimits = data;
      console.log(
        "received axis limits: top = " +
          clientAxisLimits.top +
          ", bottom = " +
          clientAxisLimits.bottom +
          ", left = " +
          clientAxisLimits.left +
          ", right = " +
          clientAxisLimits.right
      );

      socket.on("engineSocket", gamma => {
        console.log("speed-angle: " + gamma.angle);
        angle = gamma.angle;
        try {
          if (angle < -5) {
            engine.bothMotors.setBackward();
            if (angle < clientAxisLimits.bottom) {
              console.log("angle < " + clientAxisLimits.left + ", speeding out");
              engine.bothMotors.setSpeed(engine.avgMotor.getPwmRange());
            } else {
              console.log("setting speed to " + (engine.avgMotor.getPwmRange() / clientAxisLimits.bottom) * angle);
              engine.bothMotors.setSpeed(Math.round(engine.bothMotors.getPwmRange() / clientAxisLimits.bottom / angle));
            }
          } else if (angle > 5) {
            engine.bothMotors.setForward();
            if (angle > clientAxisLimits.top) {
              engine.bothMotors.setSpeed(engine.bothMotors.getPwmRange());
            } else {
              engine.bothMotors.setSpeed(Math.round((engine.avgMotor.getPwmRange() / clientAxisLimits.top) * angle));
            }
          } else {
            engine.bothMotors.setSpeed(0);
          }
        } catch (e) {
          console.log(e);
        }
      });
    });

    socket.on("engineLeftSocket", data => {});
    socket.on("engineRightSocket", data => {});
    socket.on("steeringSocket", data => {
      steering.setDirection(data);
      socket.emit(
        "servoSocket",
        (steering.leftServo.getServoPulseWidth() + steering.rightServo.getServoPulseWidth()) / 2
      );
    });
  });
})();

//Server
http.listen(8080); //listen to port 8080
console.log("waiting for connection on web-interface.");

//Event Listener
process.on("SIGINT", function() {
  //on ctrl+c
  console.log("killing server.");
  engine.bothMotors.setSpeed(0);
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
