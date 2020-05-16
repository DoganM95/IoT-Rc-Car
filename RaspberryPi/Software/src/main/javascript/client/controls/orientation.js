function handleOrientationEvent(event) {
  //        55            gamma
  // -30    +-5    30     betas  //gamma dead zone = 5 (the zone where nothing happens) for speed only, as unwanted steering is not critical
  //       -55            gamma

  roundAxisValue("speed", event.gamma, 50);
  roundAxisValue("steering", event.beta ? event.beta : event.y * 90, 50);

  //Manipulate DOM to show values on html page
  gamma.innerHTML = "Gamma: " + event.gamma;
  beta.innerHTML = "Beta: " + event.beta;
  alpha.innerHTML = "Alpha: " + event.alpha;
  absolute.innerHTML = "Absolute: " + event.absolute;
}

async function roundAxisValue(property, axisValue, timeout) {
  try {
    if (property == "speed") {
      if (semaphore.speed.free) {
        semaphore.speed.free = false;
        socket.emit("engineSocket", {
          angle: axisValue,
        });
        semaphore.speed.free = true;
      } else {
        return;
      }
    }

    //servo angle can be between 500 (== 90°(deg)) and 2500 (== -90°(deg))
    else if (property == "steering") {
      //in case function gets steering param
      if (semaphore.steering.free) {
        semaphore.steering.free = false;
        let steering = Math.round(axisValue);
        if (0 <= steering < 30) {
          socket.emit("steeringSocket", thisClient.car.steering.invert ? 1500 + Math.abs(steering) * 33 : 1500 - Math.abs(steering) * 33); //goes to max 2490, rest is handled by overtilt right to 2500
        } else if (-30 < steering <= 0) {
          socket.emit("steeringSocket", thisClient.car.steering.invert ? 1500 - Math.abs(steering) * 33 : 1500 + Math.abs(steering) * 33); //goes to min 210, rest is handled by overtilt left to 500
        } else if (steering <= -30) {
          socket.emit("steeringSocket", 2500);
        } else if (steering >= 30) {
          socket.emit("steeringSocket", 500);
        } else {
          return;
        }
        semaphore.steering.free = true;
        return;
      }
    } else {
      throw new Error("roundAxisValue() can only take 'speed' or 'steering'. You typed " + property);
    }
  } catch (err) {
    console.log(err);
  }
  return;
}
