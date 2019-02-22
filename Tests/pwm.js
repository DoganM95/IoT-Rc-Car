const Gpio = require('pigpio').Gpio;
const motor = new Gpio(18, {mode: Gpio.OUTPUT});
 
let pulseWidth = 500;
let increment = 100;
 
setInterval(() => {

//servoWrite(pulseWidth)
//pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500
//Starts servo pulses at 50Hz on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500 (most clockwise). Returns this.
    motor.servoWrite(pulseWidth);

    pulseWidth += increment;
    if (pulseWidth >= 2500) {
        increment = -100;
    } else if (pulseWidth <= 500) {
        increment = 100;
    }
}, 1000);