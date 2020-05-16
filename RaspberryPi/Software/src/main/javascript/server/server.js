const fs = require("fs"); //filesystem module
const httpsModule = require("https");
const express = require("express");
const app = express();
const path = require("path");
const ioModule = require("socket.io"); //https://www.npmjs.com/package/socket.io //socket.io module and pass the http object (server)
const pigpioModule = require("pigpio"); //https://www.npmjs.com/package/pigpio#servo-control //pigpio to enable pulse width modulation
// let three = require("three"); //https://www.npmjs.com/package/three

// Module configs
try {
  pigpioModule.configureClock(2, pigpioModule.CLOCK_PCM);
} catch (e) {
  console.log("Error while setting gpio clock:");
  console.log(e);
}
const pigpio = pigpioModule.Gpio;

const clientFiles = path.join(__dirname.replace("/server", ""), "client");

app.use(express.static(clientFiles));

const https = httpsModule.createServer(
  {
    key: fs.readFileSync(__dirname + "/certs/key.pem"),
    cert: fs.readFileSync(__dirname + "/certs/cert.pem"),
  },
  app
);

const io = ioModule(https);

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
  controls: {
    axis: {
      deadZones: {
        x: 0,
        y: 5,
      },
      limits: {
        x: 50,
        y: 30,
      },
      set: function (limitsX, limitsY, deadZoneX, deadZoneY) {
        //Sanitizes values received from client, uses predefined values if received values are invalid
        this.limits.x = typeof Number(limitsX) != Number.NaN && 1 < abs(Number(limitsX)) < 90 ? abs(limitsX) : this.limits.x;
        this.limits.y = typeof Number(limitsY) != Number.NaN && 1 < abs(Number(limitsY)) < 90 ? abs(limitsY) : this.limits.y;
        this.deadZones.x = typeof Number(deadZoneX) != Number.NaN && 0 <= abs(Number(deadZoneX)) < this.limits.x ? abs(deadZoneX) : this.deadZones.x;
        this.deadZones.y = typeof Number(deadZoneY) != Number.NaN && 0 <= abs(Number(deadZoneX)) < this.limits.y ? abs(deadZoneX) : this.deadZones.y;
        if (Number(limitsX) == Number.NaN || Number(limitsY) == Number.NaN || Number(deadZoneX) == Number.NaN || Number(deadZoneY) == Number.NaN)
          throw new Error(
            "Received invalid axis-values. Falling back to predefined limits: x =" + this.limits.x + ", y = " + this.limits.y + ", deadZone: x = " + this.deadZones.x + ", y = " + this.deadZones.y
          );
      },
    },
  },
  engine: {
    leftMotor: {
      backward: new pigpio(19, {
        mode: pigpio.OUTPUT,
      }),
      forward: new pigpio(26, {
        mode: pigpio.OUTPUT,
      }),
      setBackward: function () {
        this.forward.digitalWrite(0);
        this.backward.digitalWrite(1);
      },
      setForward: function () {
        this.forward.digitalWrite(1);
        this.backward.digitalWrite(0);
      },
      setSpeed: function (speed) {
        this.speed.pwmWrite(Math.abs(Math.round(speed)));
      },
      speed: new pigpio(21, {
        mode: pigpio.OUTPUT,
      }),
    },
    motors: {
      getPwmFrequency: function () {
        return (car.engine.leftMotor.speed.getPwmFrequency() + car.engine.rightMotor.speed.getPwmFrequency()) / 2;
      },
      getPwmRange: function () {
        return (car.engine.leftMotor.speed.getPwmRange() + car.engine.rightMotor.speed.getPwmRange()) / 2;
      },
      getSpeed: function () {
        return (car.engine.leftMotor.speed.getPwmDutyCycle() + car.engine.rightMotor.speed.getPwmDutyCycle()) / 2;
      },
      getSpeed: function () {
        return (car.engine.leftMotor.speed.getPwmDutyCycle() + car.engine.rightMotor.speed.getPwmDutyCycle()) / 2;
      },
      setBackward: function () {
        car.engine.leftMotor.forward.digitalWrite(0);
        car.engine.rightMotor.forward.digitalWrite(0);
        car.engine.rightMotor.backward.digitalWrite(1);
        car.engine.leftMotor.backward.digitalWrite(1);
      },
      setForward: function () {
        car.engine.rightMotor.forward.digitalWrite(1);
        car.engine.leftMotor.forward.digitalWrite(1);
        car.engine.rightMotor.backward.digitalWrite(0);
        car.engine.leftMotor.backward.digitalWrite(0);
      },
      setPwmFrequency: function (hertz) {
        car.engine.leftMotor.speed.pwmFrequency(hertz);
        car.engine.rightMotor.speed.pwmFrequency(hertz);
      },
      setSpeed: function (speed) {
        car.engine.leftMotor.setSpeed(speed);
        car.engine.rightMotor.setSpeed(speed);
      },
    },
    rightMotor: {
      backward: new pigpio(6, {
        mode: pigpio.OUTPUT,
      }),
      forward: new pigpio(13, {
        mode: pigpio.OUTPUT,
      }),
      setBackward: function () {
        this.forward.digitalWrite(0);
        this.backward.digitalWrite(1);
      },
      setForward: function () {
        this.forward.digitalWrite(1);
        this.backward.digitalWrite(0);
      },
      setSpeed: function (speed) {
        this.speed.pwmWrite(Math.abs(Math.round(speed)));
      },
      speed: new pigpio(20, {
        mode: pigpio.OUTPUT,
      }),
    },
  },
  sensors: {
    distance: undefined,
    speed: undefined,
  },
  steering: {
    leftServo: new pigpio(23, {
      mode: pigpio.OUTPUT,
    }),
    rightServo: new pigpio(24, {
      mode: pigpio.OUTPUT,
    }),
    setDirection: function (angle) {
      //Syncing algorithm goes here
      this.leftServo.servoWrite(angle);
      this.rightServo.servoWrite(angle);
    },
  },
};

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------

car.engine.motors.setPwmFrequency(20000);
console.log("Server Running.");
console.log("pwm range of left motor: " + car.engine.leftMotor.speed.getPwmRange());
console.log("pwm range of right motor: " + car.engine.rightMotor.speed.getPwmRange());
console.log("pwm freq of left motor: " + car.engine.leftMotor.speed.getPwmFrequency());
console.log("pwm freq of right motor: " + car.engine.rightMotor.speed.getPwmFrequency());

// Initial car state
car.steering.setDirection(1500);
car.engine.motors.setSpeed(0);

//Server Socket listener
io.sockets.on("connection", function (socket) {
  //Prologue
  client.identity = socket.client;
  console.log("Connected: " + client.identity.conn.remoteAddress + " - " + new Date().toUTCString());

  //Listeners
  socket.on("clientAxisSettings", (data) => {
    console.log("Client Axis Settings: \n" + data);
    try {
      let axisSettings = JSON.parse(data);
      try {
        car.controls.axis.set(axisSettings.limits.x, axisSettings.limits.y, axisSettings.deadZones.x, axisSettings.deadZones.y);
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log("Error parsing settings:");
      console.log(e);
    }
  });

  socket.on("engineSocket", (gamma) => {
    console.log("speed-angle: " + gamma.angle);
    client.state.sensors.deviceorientation.gamma = gamma.angle;
    try {
      if (client.state.sensors.deviceorientation.gamma < -5) {
        car.engine.motors.setBackward();
        if (client.state.sensors.deviceorientation.gamma < client.settings.axisLimits.bottom) {
          console.log("client.state.sensors.deviceorientation.gamma < " + client.settings.axisLimits.left + ", speeding out");
          car.engine.motors.setSpeed(car.engine.avgMotor.getPwmRange());
        } else {
          console.log(
            "setting speed to " + (car.engine.avgMotor.getPwmRange() / (client.settings.axisLimits.bottom - client.settings.axisLimits.deadzone.bottom)) * client.state.sensors.deviceorientation.gamma
          );
          car.engine.motors.setSpeed(Math.round((car.engine.avgMotor.getPwmRange() / client.settings.axisLimits.bottom) * client.state.sensors.deviceorientation.gamma));
        }
      } else if (client.state.sensors.deviceorientation.gamma > 5) {
        car.engine.motors.setForward();
        if (client.state.sensors.deviceorientation.gamma > client.settings.axisLimits.top) {
          car.engine.motors.setSpeed(car.engine.avgMotor.getPwmRange());
        } else {
          car.engine.motors.setSpeed(
            Math.round((car.engine.avgMotor.getPwmRange() / (client.settings.axisLimits.top - client.settings.axisLimits.deadzone.top)) * client.state.sensors.deviceorientation.gamma)
          );
        }
      } else {
        car.engine.motors.setSpeed(0);
      }
    } catch (e) {
      console.log(e);
    }
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
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
function shutDown() {
  console.log("killing server.");
  car.engine.motors.setSpeed(0);
  car.steering.setDirection(1500);
  https.close();
  app.removeAllListeners();
  app.disable();
  process.exit(0); //TODO: ensure process exit
}
