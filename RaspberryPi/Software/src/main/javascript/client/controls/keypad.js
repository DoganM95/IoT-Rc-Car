async function keypadHandler(key) {
  console.log("Key: " + key.keyCode + " pressed."); //log the pressed key
  switch (
    key.keyCode //switch statement for pressed key
  ) {
    case 40: //backward
      if (thisClient.car.engine.speed.value > 0) {
        socket.emit("motorSocket", thisClient.car.engine.speed.value - thisClient.car.engine.speed.increment);
      }
      break;
    case 38: //forward
      if (thisClient.car.engine.speed.value < 255) {
        socket.emit("motorSocket", thisClient.car.engine.speed.value + thisClient.car.engine.speed.increment);
      }
      break;
    case 53: //Full Speed or stop (like play pause)
      if (thisClient.car.engine.speed.value > 0) {
        socket.emit("motorSocket", 0); //stops motor, if motor is running
      }
      if (thisClient.car.engine.speed.value == 0) {
        socket.emit("motorSocket", 255); //max-speeds motor, if it was off
      }
      break;
    //Servo direction control
    case 39: //key right
      if (thisClient.car.steering.angle.value > 500) {
        socket.emit("steeringSocket", thisClient.car.steering.angle.value - thisClient.car.steering.angle.increment);
        thisClient.car.steering.angle.value -= thisClient.car.steering.angle.increment;
      }
      break;
    case 37: //key left
      if (thisClient.car.steering.angle.value < 2500) {
        socket.emit("steeringSocket", thisClient.car.steering.angle.value + thisClient.car.steering.angle.increment);
        thisClient.car.steering.angle.value += thisClient.car.steering.angle.increment;
      }
      break;
  }

  //TODO: replace current keys with "w,a,s,d" for precise control and assign arrow keys to static (full value) control
  // w = 87, a = 65, s = 83, d = 68
  //up = 38, left = 37, down = 40, right = 39
}
