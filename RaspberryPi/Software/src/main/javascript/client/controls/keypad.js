async function handleKeydownEvent(key) {
  console.log("Key: " + key.keyCode + " pressed."); //log the pressed key
  switch (
    key.keyCode //switch statement for pressed key
  ) {
    //Precise control
    //--------------------
    case 83: // key: s, drive backward
      thisClient.car.engine.motors.speed.value =
        thisClient.car.engine.motors.speed.value - thisClient.car.engine.motors.speed.increment <= thisClient.settings.control.keypad.limits.y.min
          ? thisClient.settings.control.keypad.limits.y.min
          : thisClient.car.engine.motors.speed.value - thisClient.car.engine.motors.speed.increment;
      socket.emit("control_engine_by_keypad", thisClient.car.engine.motors.speed.value);
      break;
    case 87: //key: w, drive forward
      thisClient.car.engine.motors.speed.value =
        thisClient.car.engine.motors.speed.value + thisClient.car.engine.motors.speed.increment >= thisClient.settings.control.keypad.limits.y.max
          ? thisClient.settings.control.keypad.limits.y.max
          : thisClient.car.engine.motors.speed.value + thisClient.car.engine.motors.speed.increment;
      socket.emit("control_engine_by_keypad", thisClient.car.engine.motors.speed.value);
      break;
    case 65: //key: a, steer left
      thisClient.car.steering.servos.angle.value =
        thisClient.car.steering.servos.angle.value - thisClient.car.steering.servos.angle.increment <= thisClient.settings.controls.keypad.limits.x.min
          ? thisClient.settings.controls.keypad.limits.x.min
          : thisClient.car.steering.servos.angle.value - thisClient.car.steering.servos.angle.increment;
      socket.emit("control_steering_by_keypad", thisClient.car.steering.servos.angle.value);
      break;
    case 68: //key: d, steer right
      thisClient.car.steering.servos.angle.value =
        thisClient.car.steering.servos.angle.value + thisClient.car.steering.servos.angle.increment >= thisClient.settings.controls.keypad.limits.x.max
          ? thisClient.settings.controls.keypad.limits.x.max
          : thisClient.car.steering.servos.angle.value + thisClient.car.steering.servos.angle.increment;
      socket.emit("control_steering_by_keypad", thisClient.car.steering.servos.angle.value);
      break;
  }
  //Rough Control
  //--------------------
  //TODO:
  //up = 38, left = 37, down = 40, right = 39
}
