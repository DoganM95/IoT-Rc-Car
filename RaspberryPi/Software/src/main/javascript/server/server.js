const fs = require("fs");
const httpsModule = require("https");
const express = require("express");
const app = express();
const path = require("path");
const ioModule = require("socket.io");
const pigpioModule = require("pigpio");

//-----------------------------------------------------------------------------
// Module configurations
//-----------------------------------------------------------------------------

try {
  pigpioModule.configureClock(2, pigpioModule.CLOCK_PCM); //Sets PwmFrequency to 2 micro seonds (see table in pigpio docs)
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
  //TODO: cleanup
  identity: undefined,
  settings: {
    controls: {
      axis: {
        sockets: {
          x: {
            //TODO: fix
            set: function (data) {
              let dataAsNum = Number(data);
              if (Number.isFinite(dataAsNum)) {
                if (Math.abs(dataAsNum) <= client.settings.controls.axis.bounds.x) {
                  car.steering.servos.setDirection(data);
                } else {
                  //Bounds exceeded
                  if (dataAsNum < -client.settings.controls.axis.bounds.x) car.steering.servos;
                }
              } else {
                car.steering.servos.setDirection(0);
              }
            },
          },
          y: {
            //TODO: fix
            set: function (data) {
              let dataAsNum = Number(data);
              if (Number.isFinite(dataAsNum) && client.settings.controls.axis.bounds.y <= Math.abs(dataAsNum)) {
                if (dataAsNum < 0) car.engine.motors;
              } else car.steering.servos.setDirection(0);
            },
          },
        },
        range: {
          x: {
            bounds: 50,
            deadZones: 0,
            precision: 0,
          },
          y: {
            bounds: 30,
            deadZones: 5,
            precision: 0,
          },
        },
        configure: function (boundsX, boundsY, deadZoneX, deadZoneY) {
          //Sanitizes values received from client, uses predefined values if received values are invalid
          parseInt();
          this.range.x.bounds = Number(boundsX) != Number.NaN && 1 < Math.abs(Number(boundsX)) < 90 ? Math.abs(boundsX) : this.range.x.bounds;
          this.range.y = Number(boundsY) != Number.NaN && 1 < Math.abs(Number(boundsY)) < 90 ? Math.abs(boundsY) : this.range.y;
          this.range.x.deadZoness = Number(deadZoneX) != Number.NaN && 0 <= Math.abs(Number(deadZoneX)) < this.range.x.bounds ? Math.abs(deadZoneX) : this.range.x.deadZones;
          this.range.y.deadZones = Number(deadZoneY) != Number.NaN && 0 <= Math.abs(Number(deadZoneX)) < this.range.y ? Math.abs(deadZoneX) : this.range.y.deadZones;
          if (Number(boundsX) == Number.NaN || Number(boundsY) == Number.NaN || Number(deadZoneX) == Number.NaN || Number(deadZoneY) == Number.NaN)
            throw new Error(
              "Received invalid axis-values. Falling back to predefined bounds: x =" +
                this.range.x.bounds +
                ", y = " +
                this.range.y +
                ", deadZone: x = " +
                this.range.x.deadZones +
                ", y = " +
                this.range.y.deadZones
            );
        },
        transmissionMode: {
          mode: {
            //TODO: Implement usage
            continuously: false,
            onChangeOnly: true,
          },
        },
      },
      keypad: {
        sockets: {
          x: {
            set: function (data) {
              let dataAsNum = Number(data);
              if (Number.isInteger(dataAsNum)) {
                dataAsNum = Math.abs(dataAsNum);
                if (Math.abs(dataAsNum)) {
                  car.steering.servos.setDirection(data);
                } else {
                  //Bounds exceeded
                  if (dataAsNum < -client.settings.controls.axis.bounds.x) car.steering.servos;
                }
              } else {
                car.steering.servos.setDirection(0);
              }
            },
          },
        },
        range: {
          x: {
            bounds: 1000,
            increment: 1000 / 100,
          },
          y: {
            bounds: 20000,
            increment: 20000 / 100,
          },
          setBounds: function (boundsX, boundsY, incrementX, incrementY) {
            //Sanitizes values received from client, uses predefined values if received values are invalid
            client.settings.controls.keypad.range.x.bounds =
              Number(boundsX) != Number.NaN && Number(boundsX) <= car.steering.servos.limits.max - car.steering.servos.limits.min / 2
                ? Number(boundsX)
                : car.steering.servos.limits.max - car.steering.servos.limits.min / 2;

            client.settings.controls.keypad.range.y.bounds = Number(boundsY) != Number.NaN && Number(boundsY) <= car.engine.motors.limits ? Number(boundsY) : car.engine.motors.limits;

            client.settings.controls.keypad.range.x.increment =
              Number(incrementX) != Number.NaN && Number(incrementX) <= car.steering.servos.limits.max - car.steering.servos.limits.min / 2
                ? Number(incrementX)
                : car.steering.servos.limits.max - car.steering.servos.limits.min / 2 / 100;

            client.settings.controls.keypad.range.y.increment =
              Number(incrementY) != Number.NaN && Number(incrementY) <= car.engine.motors.limits ? Number(incrementY) : car.engine.motors.limits / 100;
          },
        },
      },

      multipleSimultaneousClientsAllowed: false,
      offsets: {
        //TODO: implement usage
        x: {
          leftServo: 0,
          rightServo: 0,
        },
      },
    },
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
  init: function () {
    car.engine.motors.setPwmFrequency(this.engine.motors.pwmFrequency);
    car.engine.motors.setPwmRange(this.engine.motors.pwmFrequency);
    console.log("pwm range of left motor: " + car.engine.motors.left.speed.getPwmRange());
    console.log("pwm range of right motor: " + car.engine.motors.right.speed.getPwmRange());
    console.log("pwm freq of left motor: " + car.engine.motors.left.speed.getPwmFrequency());
    console.log("pwm freq of right motor: " + car.engine.motors.right.speed.getPwmFrequency());
    car.steering.servos.setDirection(1500); // Initial steering state
    car.engine.motors.setSpeed(0); // Initial engine state
  },
  engine: {
    motors: {
      limits: 20000,
      pwmFrequency: 20000,
      getPwmFrequency: function () {
        return (this.left.speed.getPwmFrequency() + this.right.speed.getPwmFrequency()) / 2;
      },
      getPwmRange: function () {
        return (this.left.speed.getPwmRange() + this.right.speed.getPwmRange()) / 2;
      },
      getSpeed: function () {
        return (this.left.speed.getPwmDutyCycle() + this.right.speed.getPwmDutyCycle()) / 2;
      },
      setPwmRange: function (pwmRange) {
        this.left.speed.pwmRange(pwmRange);
        this.right.speed.pwmRange(pwmRange);
      },
      setBackward: function () {
        this.left.forward.digitalWrite(0);
        this.right.forward.digitalWrite(0);
        this.right.backward.digitalWrite(1);
        this.left.backward.digitalWrite(1);
      },
      setForward: function () {
        this.right.forward.digitalWrite(1);
        this.left.forward.digitalWrite(1);
        this.right.backward.digitalWrite(0);
        this.left.backward.digitalWrite(0);
      },
      setPwmFrequency: function (hertz) {
        this.left.speed.pwmFrequency(hertz);
        this.right.speed.pwmFrequency(hertz);
      },
      setSpeed: function (pwmDutyCycle) {
        this.left.setSpeed(pwmDutyCycle);
        this.right.setSpeed(pwmDutyCycle);
      },
      left: {
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
        setSpeed: function (pwmDutyCycle) {
          this.speed.pwmWrite(Math.abs(Math.round(pwmDutyCycle)));
        },
        speed: new pigpio(21, {
          mode: pigpio.OUTPUT,
        }),
      },
      right: {
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
        setSpeed: function (pwmDutyCycle) {
          this.speed.pwmWrite(Math.abs(Math.round(pwmDutyCycle)));
        },
        speed: new pigpio(20, {
          mode: pigpio.OUTPUT,
        }),
      },
    },
  },
  sensors: {
    //TODO: implement usage
    distance: undefined,
    speed: undefined,
  },
  steering: {
    servos: {
      limits: {
        // Change to adjust max steering angle
        min: 500,
        max: 2500,
      },
      left: {
        pin: new pigpio(23, {
          mode: pigpio.OUTPUT,
        }),
        offset: 0,
      },

      right: {
        pin: new pigpio(24, {
          mode: pigpio.OUTPUT,
        }),
        offset: 0,
      },

      setDirection: function (pulseWidth) {
        //Syncing algorithm goes here
        this.left.servoWrite(pulseWidth);
        this.right.servoWrite(pulseWidth);
      },
    },
  },
};

//-----------------------------------------------------------------------------
//Main
//-----------------------------------------------------------------------------

car.init();

//Server Socket listener
io.sockets.on("connection", function (socket) {
  //Prologue
  client.identity = socket.client;
  console.log("Connected: " + client.identity.conn.remoteAddress.replace("::fff:", "") + " - " + new Date().toUTCString());

  //TODO: adapt to new object model
  //Listeners
  socket.on("clientAxisSettings", (data) => {
    console.log("Client Axis Settings: \n" + data);
    try {
      let axisSettings = JSON.parse(data);
      try {
        client.settings.controls.axis.configure(axisSettings.bounds.x, axisSettings.bounds.y, axisSettings.deadZones.x, axisSettings.deadZones.y);
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log("Error parsing settings:");
      console.log(e);
    }
  });

  //TODO: implement
  socket.on("clientAxisSettings", (data) => {
    console.log("Client Keypad Settings: \n" + data);
    try {
      let keypadSettings = JSON.parse(data);
      try {
        client.settings.controls.keypad.setBounds(axisSettings.bounds.x, axisSettings.bounds.y, axisSettings.deadZones.x, axisSettings.deadZones.y);
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log("Error parsing settings:");
      console.log(e);
    }
  });

  //TODO: control_engine_by_keypad
  socket.on("control_engine_by_keypad", (data) => {});

  //TODO: cleanup
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
  //TODO: check
  socket.on("steeringSocket", (data) => {
    car.steering.servos.setDirection(data);
    // socket.emit("servoSocket", (car.steering.servos.left.getServoPulseWidth() + car.steering.servos.right.getServoPulseWidth()) / 2);
  });

  //NEW variants:
  socket.on("control_engine_by_keypad", (data) => {});
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
  car.steering.servos.setDirection(1500);
  https.close();
  app.removeAllListeners();
  app.disable();
  process.exit(0); //TODO: ensure process exit
}
