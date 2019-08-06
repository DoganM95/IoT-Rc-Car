// NPM Modules
let http = require("http").createServer(httpHandler); //require http server, and create server with function handler()
let https = require("https").createServer(httpHandler); //NEEDS FIX
let fs = require("fs"); //require filesystem module
let io = require("socket.io")(http); //https://www.npmjs.com/package/socket.io //require socket.io module and pass the http object (server)
let gpio = require("onoff").Gpio; //https://www.npmjs.com/package/onoff#class-gpio //include onoff to interact with the GPIO
let pigpioModule = require("pigpio"); //https://www.npmjs.com/package/pigpio#servo-control //include pigpio to enable pulse width modulation for servo
let three = require("three"); //https://www.npmjs.com/package/three //

// Module configs
pigpioModule.configureClock(2, pigpioModule.CLOCK_PCM);
let pigpio = pigpioModule.Gpio;
import { thisClient as client } from "./index.html";
//-----------------------------------------------------------------------------
//Variables
//-----------------------------------------------------------------------------
let clients = {
  current: {
    identity: new Object(),
    settings: client.settings,
    state: {
      sensors: {
        deviceorientation: {
          alpha: 0,
          beta: 0,
          gamma: 0
        }
      }
    }
  },
  predecessor: {
    identity: new Object()
  },
  list: []
};

let car = {
  steering: {
    leftServo: new pigpio(23, { mode: pigpio.OUTPUT }),
    rightServo: new pigpio(24, { mode: pigpio.OUTPUT }),
    setDirection: function(angle) {
      //Syncing algorithm comes here
      this.leftServo.servoWrite(angle);
      this.rightServo.servoWrite(angle);
    }
  },
  engine: {
    leftMotor: {
      forward: new pigpio(26, {
        mode: pigpio.OUTPUT
      }),
      backward: new pigpio(19, {
        mode: pigpio.OUTPUT
      }),
      speed: new pigpio(21, {
        mode: pigpio.OUTPUT
      }),
      setForward: function() {
        this.forward.digitalWrite(1);
        this.backward.digitalWrite(0);
      },
      setBackward: function() {
        this.forward.digitalWrite(0);
        this.backward.digitalWrite(1);
      },
      setSpeed: function(speed) {
        this.speed.pwmWrite(Math.abs(Math.round(speed)));
      }
    },
    rightMotor: {
      forward: new pigpio(13, {
        mode: pigpio.OUTPUT
      }),
      backward: new pigpio(6, {
        mode: pigpio.OUTPUT
      }),
      speed: new pigpio(20, {
        mode: pigpio.OUTPUT
      }),
      setForward: function() {
        this.forward.digitalWrite(1);
        this.backward.digitalWrite(0);
      },
      setBackward: function() {
        this.forward.digitalWrite(0);
        this.backward.digitalWrite(1);
      },
      setSpeed: function(speed) {
        this.speed.pwmWrite(Math.abs(Math.round(speed)));
      }
    },
    bothMotors: {
      setForward: function() {
        car.engine.rightMotor.forward.digitalWrite(1);
        car.engine.leftMotor.forward.digitalWrite(1);
        car.engine.rightMotor.backward.digitalWrite(0);
        car.engine.leftMotor.backward.digitalWrite(0);
      },
      setBackward: function() {
        car.engine.leftMotor.forward.digitalWrite(0);
        car.engine.rightMotor.forward.digitalWrite(0);
        car.engine.rightMotor.backward.digitalWrite(1);
        car.engine.leftMotor.backward.digitalWrite(1);
      },
      setSpeed: function(speed) {
        car.engine.leftMotor.setSpeed(speed);
        car.engine.rightMotor.setSpeed(speed);
      },
      setPwmFrequency: function(hertz) {
        car.engine.leftMotor.speed.pwmFrequency(hertz);
        car.engine.rightMotor.speed.pwmFrequency(hertz);
      }
    },
    avgMotor: {
      getSpeed: function() {
        return (car.engine.leftMotor.speed.getPwmDutyCycle() + car.engine.rightMotor.speed.getPwmDutyCycle()) / 2;
      },
      getSpeed: function() {
        return (car.engine.leftMotor.speed.getPwmDutyCycle() + car.engine.rightMotor.speed.getPwmDutyCycle()) / 2;
      },
      getPwmFrequency: function() {
        return (car.engine.leftMotor.speed.getPwmFrequency() + car.engine.rightMotor.speed.getPwmFrequency()) / 2;
      },
      getPwmRange: function() {
        return (car.engine.leftMotor.speed.getPwmRange() + car.engine.rightMotor.speed.getPwmRange()) / 2;
      }
    }
  },
  sensors: {
    speed: undefined,
    distance: undefined
  }
};

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------
car.engine.bothMotors.setPwmFrequency(20000);
console.log("pwm range of left car.engine: " + car.engine.leftMotor.speed.getPwmRange());
console.log("pwm range of right car.engine: " + car.engine.rightMotor.speed.getPwmRange());
console.log("pwm freq of left car.engine: " + car.engine.leftMotor.speed.getPwmFrequency());
console.log("pwm freq of right car.engine: " + car.engine.rightMotor.speed.getPwmFrequency());

//Server Socket listener
io.sockets.on("connection", function(socket) {
  console.log("Connected: " + socket.clients.conn.remoteAddress + " - " + new Date().toUTCString());
  try {
    clients.predecessor.identity.conn.removeAllListeners();
  } catch (e) {
    console.log("no client to pop!");
  }
  clients.predecessor.identity = clients.list[clients.list.length - 1];
  clients.current.identity = socket.client;
  clients.list.push(socket.client);

  socket.on("axisLimits", data => {
    clients.current.settings.axisLimits = data;
    console.log(
      "received axis limits: top = " +
        clients.current.settings.axisLimits.top +
        ", bottom = " +
        clients.current.settings.axisLimits.bottom +
        ", left = " +
        clients.current.settings.axisLimits.left +
        ", right = " +
        clients.current.settings.axisLimits.right
    );

    socket.on("engineSocket", gamma => {
      console.log("speed-angle: " + gamma.angle);
      clients.current.sensors.deviceorientation.gamma = gamma.angle;
      try {
        if (clients.current.sensors.deviceorientation.gamma < -5) {
          car.engine.bothMotors.setBackward();
          if (clients.current.sensors.deviceorientation.gamma < clients.current.settings.axisLimits.bottom) {
            console.log(
              "clients.current.sensors.deviceorientation.gamma < " +
                clients.current.settings.axisLimits.left +
                ", speeding out"
            );
            car.engine.bothMotors.setSpeed(car.engine.avgMotor.getPwmRange());
          } else {
            console.log(
              "setting speed to " +
                (car.engine.avgMotor.getPwmRange() /
                  (clients.current.settings.axisLimits.bottom - clients.current.settings.axisLimits.deadzone.bottom)) *
                  clients.current.sensors.deviceorientation.gamma
            );
            car.engine.bothMotors.setSpeed(
              Math.round(
                (car.engine.avgMotor.getPwmRange() / clients.current.settings.axisLimits.bottom) *
                  clients.current.sensors.deviceorientation.gamma
              )
            );
          }
        } else if (clients.current.sensors.deviceorientation.gamma > 5) {
          car.engine.bothMotors.setForward();
          if (clients.current.sensors.deviceorientation.gamma > clients.current.settings.axisLimits.top) {
            car.engine.bothMotors.setSpeed(car.engine.avgMotor.getPwmRange());
          } else {
            car.engine.bothMotors.setSpeed(
              Math.round(
                (car.engine.avgMotor.getPwmRange() /
                  (clients.current.settings.axisLimits.top - clients.current.settings.axisLimits.deadzone.top)) *
                  clients.current.sensors.deviceorientation.gamma
              )
            );
          }
        } else {
          car.engine.bothMotors.setSpeed(0);
        }
      } catch (e) {
        console.log(e);
      }
    });
  });

  socket.on("steeringSocket", data => {
    car.steering.setDirection(data);
    socket.emit(
      "servoSocket",
      (car.steering.leftServo.getServoPulseWidth() + car.steering.rightServo.getServoPulseWidth()) / 2
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
  car.engine.bothMotors.setSpeed(0);
  car.steering.setDirection(1500);
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
