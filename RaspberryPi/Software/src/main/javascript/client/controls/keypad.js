async function handleKeydownEventPreciseControl(key) {
  console.log("Key: " + key.keyCode + " pressed.");
  switch (key.keyCode) {
    //Precise control
    //--------------------
    case 87: //key: w, drive forward
      thisClient.car.engine.motors.speed.value =
        thisClient.car.engine.motors.speed.value + thisClient.settings.controls.keypad.range.y.increment >= thisClient.settings.controls.keypad.range.y.bounds
          ? thisClient.settings.controls.keypad.range.y.bounds
          : thisClient.car.engine.motors.speed.value + thisClient.settings.controls.keypad.range.y.increment;
      socket.emit("control_engine_by_keypad", thisClient.car.engine.motors.speed.value);
      break;
    case 83: // key: s, drive backward
      thisClient.car.engine.motors.speed.value =
        thisClient.car.engine.motors.speed.value - thisClient.settings.controls.keypad.range.y.increment <= -thisClient.settings.controls.keypad.range.y.bounds
          ? thisClient.settings.controls.keypad.range.y.min
          : thisClient.car.engine.motors.speed.value - thisClient.settings.controls.keypad.range.y.increment;
      socket.emit("control_engine_by_keypad", thisClient.car.engine.motors.speed.value);
      break;
    case 65: //key: a, steer left
      thisClient.car.steering.servos.direction.value =
        thisClient.car.steering.servos.direction.value - thisClient.settings.controls.keypad.range.x.increment <= -thisClient.settings.controls.keypad.range.x.bounds
          ? -thisClient.settings.controls.keypad.range.x.bounds
          : thisClient.car.steering.servos.direction.value - thisClient.settings.controls.keypad.range.x.increment;
      socket.emit("control_steering_by_keypad", thisClient.car.steering.servos.direction.value);
      break;
    case 68: //key: d, steer right
      thisClient.car.steering.servos.direction.value =
        thisClient.car.steering.servos.direction.value + thisClient.settings.controls.keypad.range.x.increment >= thisClient.settings.controls.keypad.range.x.bounds
          ? thisClient.settings.controls.keypad.range.x.bounds
          : thisClient.car.steering.servos.direction.value + thisClient.settings.controls.keypad.range.x.increment;
      socket.emit("control_steering_by_keypad", thisClient.car.steering.servos.direction.value);
      break;
    //TODO: let space key emit speed=0
  }
}

async function handleKeydownEventRoughControl(key) {
  console.log("Key: " + key.keyCode + " down.");
  switch (key.keyCode) {
    //Rough Control: up = 38, left = 37, down = 40, right = 39

    case 38: //key up, drive forward
      thisClient.car.engine.motors.speed.value = thisClient.settings.controls.keypad.range.y.bounds;
      socket.emit("control_engine_by_keypad", thisClient.car.engine.motors.speed.value);
      break;
    case 40: //key down, drive backward
      thisClient.car.engine.motors.speed.value = thisClient.settings.controls.keypad.range.y.min;
      socket.emit("control_engine_by_keypad", thisClient.car.engine.motors.speed.value);
      break;
    case 37: //key left, steer left
      thisClient.car.steering.servos.direction.value = -thisClient.settings.controls.keypad.range.x.bounds;
      socket.emit("control_steering_by_keypad", thisClient.car.steering.servos.direction.value);
      break;
    case 39: //key right, steer right
      thisClient.car.steering.servos.direction.value = thisClient.settings.controls.keypad.range.x.bounds;
      socket.emit("control_steering_by_keypad", thisClient.car.steering.servos.direction.value);
      break;
  }
}

async function handleKeyupEventRoughControl(key) {
  console.log("Key: " + key.keyCode + " up.");
  switch (key.keyCode) {
    //Rough Control: up = 38, left = 37, down = 40, right = 39

    case 38: //key up, stopping
      thisClient.car.steering.servos.direction.value = thisClient.settings.controls.keypad.range.x.bounds;
      socket.emit("control_engine_by_keypad", 0);
      break;
    case 40: //key down, stopping
      socket.emit("control_engine_by_keypad", 0);
      break;
    case 37: //key left, steer center
      socket.emit("control_steering_by_keypad", 0);
      break;
    case 37: //key right, steer center
      socket.emit("control_steering_by_keypad", 0);
      break;
  }
}
