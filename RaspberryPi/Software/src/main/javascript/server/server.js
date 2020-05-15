// const http = require("http").createServer(httpHandler);
let httpsModule = require("https");
const fs = require("fs"); //filesystem module
const ioModule = require("socket.io"); //https://www.npmjs.com/package/socket.io //socket.io module and pass the http object (server)
const pigpioModule = require("pigpio"); //https://www.npmjs.com/package/pigpio#servo-control //pigpio to enable pulse width modulation
// let three = require("three"); //https://www.npmjs.com/package/three

// Module configs
try {
  pigpioModule.configureClock(2, pigpioModule.CLOCK_PCM);
} catch (e) {
  console.log(e);
}

const pigpio = pigpioModule.Gpio;

let https = httpsModule.createServer(
  {
    key: fs.readFileSync(__dirname + "/certs/key.pem"),
    cert: fs.readFileSync(__dirname + "/certs/cert.pem"),
  },
  (req, res) => {
    fs.readFile(__dirname.replace("/server", "/client") + "/index.html", function (err, data) {
      if (!err) {
        res.writeHead(200, {
          "Content-Type": "text/html",
        }); //write HTML
        res.write(data); //write data from index.html
        res.end();
        return;
      } else {
        res.writeHead(404, {
          "Content-Type": "text/html",
        });
        res.end("404 Not Found");
        return;
      }
    });
  }
);

let io = ioModule(https);

// import { thisClient as client } from "./index.html";

//-----------------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------------

let client = {
  identity: undefined,
  settings: {
    engine: {},
    steering: {
      leftServoOffset: 0,
      rightServoOffset: 0,
    },
  },
  state: {
    sensors: {
      deviceorientation: {
        exists: undefined,
        alpha: 0,
        beta: 0,
        gamma: 0,
      },
    },
  },
};

let car = {
  steering: {
    leftServo: new pigpio(23, { mode: pigpio.OUTPUT }),
    rightServo: new pigpio(24, { mode: pigpio.OUTPUT }),
    setDirection: function (angle) {
      //Syncing algorithm goes here
      this.leftServo.servoWrite(angle);
      this.rightServo.servoWrite(angle);
    },
  },
  engine: {
    leftMotor: {
      forward: new pigpio(26, {
        mode: pigpio.OUTPUT,
      }),
      backward: new pigpio(19, {
        mode: pigpio.OUTPUT,
      }),
      speed: new pigpio(21, {
        mode: pigpio.OUTPUT,
      }),
      setForward: function () {
        this.forward.digitalWrite(1);
        this.backward.digitalWrite(0);
      },
      setBackward: function () {
        this.forward.digitalWrite(0);
        this.backward.digitalWrite(1);
      },
      setSpeed: function (speed) {
        this.speed.pwmWrite(Math.abs(Math.round(speed)));
      },
    },
    rightMotor: {
      forward: new pigpio(13, {
        mode: pigpio.OUTPUT,
      }),
      backward: new pigpio(6, {
        mode: pigpio.OUTPUT,
      }),
      speed: new pigpio(20, {
        mode: pigpio.OUTPUT,
      }),
      setForward: function () {
        this.forward.digitalWrite(1);
        this.backward.digitalWrite(0);
      },
      setBackward: function () {
        this.forward.digitalWrite(0);
        this.backward.digitalWrite(1);
      },
      setSpeed: function (speed) {
        this.speed.pwmWrite(Math.abs(Math.round(speed)));
      },
    },
    Motors: {
      setForward: function () {
        car.engine.rightMotor.forward.digitalWrite(1);
        car.engine.leftMotor.forward.digitalWrite(1);
        car.engine.rightMotor.backward.digitalWrite(0);
        car.engine.leftMotor.backward.digitalWrite(0);
      },
      setBackward: function () {
        car.engine.leftMotor.forward.digitalWrite(0);
        car.engine.rightMotor.forward.digitalWrite(0);
        car.engine.rightMotor.backward.digitalWrite(1);
        car.engine.leftMotor.backward.digitalWrite(1);
      },
      setSpeed: function (speed) {
        car.engine.leftMotor.setSpeed(speed);
        car.engine.rightMotor.setSpeed(speed);
      },
      setPwmFrequency: function (hertz) {
        car.engine.leftMotor.speed.pwmFrequency(hertz);
        car.engine.rightMotor.speed.pwmFrequency(hertz);
      },
      getSpeed: function () {
        return (car.engine.leftMotor.speed.getPwmDutyCycle() + car.engine.rightMotor.speed.getPwmDutyCycle()) / 2;
      },
      getSpeed: function () {
        return (car.engine.leftMotor.speed.getPwmDutyCycle() + car.engine.rightMotor.speed.getPwmDutyCycle()) / 2;
      },
      getPwmFrequency: function () {
        return (car.engine.leftMotor.speed.getPwmFrequency() + car.engine.rightMotor.speed.getPwmFrequency()) / 2;
      },
      getPwmRange: function () {
        return (car.engine.leftMotor.speed.getPwmRange() + car.engine.rightMotor.speed.getPwmRange()) / 2;
      },
    },
  },
  sensors: {
    speed: undefined,
    distance: undefined,
  },
};

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------
car.engine.Motors.setPwmFrequency(20000);
console.log("pwm range of left car.engine: " + car.engine.leftMotor.speed.getPwmRange());
console.log("pwm range of right car.engine: " + car.engine.rightMotor.speed.getPwmRange());
console.log("pwm freq of left car.engine: " + car.engine.leftMotor.speed.getPwmFrequency());
console.log("pwm freq of right car.engine: " + car.engine.rightMotor.speed.getPwmFrequency());

//Server Socket listener
io.sockets.on("connection", function (socket) {
  //Prologue
  client.identity = socket.client;
  console.log("Connected: " + client.identity.conn.remoteAddress + " - " + new Date().toUTCString());

  //Listeners
  socket.on("axisLimits", (data) => {
    console.log("data rec: " + data);
    try {
      client.settings.axisLimits = data;
      console.log(
        "received axis limits: top = " +
          client.settings.axisLimits.top +
          ", bottom = " +
          client.settings.axisLimits.bottom +
          ", left = " +
          client.settings.axisLimits.left +
          ", right = " +
          client.settings.axisLimits.right
      );
    } catch (e) {
      console.log(e);
    }

    socket.on("engineSocket", (gamma) => {
      console.log("speed-angle: " + gamma.angle);
      client.state.sensors.deviceorientation.gamma = gamma.angle;
      try {
        if (client.state.sensors.deviceorientation.gamma < -5) {
          car.engine.Motors.setBackward();
          if (client.state.sensors.deviceorientation.gamma < client.settings.axisLimits.bottom) {
            console.log("client.state.sensors.deviceorientation.gamma < " + client.settings.axisLimits.left + ", speeding out");
            car.engine.Motors.setSpeed(car.engine.avgMotor.getPwmRange());
          } else {
            console.log(
              "setting speed to " +
                (car.engine.avgMotor.getPwmRange() / (client.settings.axisLimits.bottom - client.settings.axisLimits.deadzone.bottom)) * client.state.sensors.deviceorientation.gamma
            );
            car.engine.Motors.setSpeed(Math.round((car.engine.avgMotor.getPwmRange() / client.settings.axisLimits.bottom) * client.state.sensors.deviceorientation.gamma));
          }
        } else if (client.state.sensors.deviceorientation.gamma > 5) {
          car.engine.Motors.setForward();
          if (client.state.sensors.deviceorientation.gamma > client.settings.axisLimits.top) {
            car.engine.Motors.setSpeed(car.engine.avgMotor.getPwmRange());
          } else {
            car.engine.Motors.setSpeed(
              Math.round((car.engine.avgMotor.getPwmRange() / (client.settings.axisLimits.top - client.settings.axisLimits.deadzone.top)) * client.state.sensors.deviceorientation.gamma)
            );
          }
        } else {
          car.engine.Motors.setSpeed(0);
        }
      } catch (e) {
        console.log(e);
      }
    });
  });

  socket.on("steeringSocket", (data) => {
    car.steering.setDirection(data);
    socket.emit("servoSocket", (car.steering.leftServo.getServoPulseWidth() + car.steering.rightServo.getServoPulseWidth()) / 2);
  });
});

//Server
https.listen(16207);
console.log("waiting for connection on web-interface.");

//Event Listener
process.on("SIGINT", function () {
  //on ctrl+c
  console.log("killing server.");
  car.engine.Motors.setSpeed(0);
  car.steering.setDirection(1500);
  process.exit(); //exit completely
});

//-----------------------------------------------------------------------------
//Functions
//-----------------------------------------------------------------------------
