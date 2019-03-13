# Raspberry Pi Lego RC-Car

## Ports used:

### FTP:
pi-rc.ddns.net:21  

### Web-access:
pi-rc.ddns.net8080

### SSH:
pi-rc.ddns.net:22

### VNC:
pi-rc.ddns.net:5900

### Fallback FTP:
pi-rc.ddns.net:2020  

## Functions used:

> `servoWrite(pulseWidth)`   
> pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500    
> Starts servo pulses at 50Hz on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500 (most clockwise). Returns this.

## How to use
    1. in console cd to Project and type: "sudo node webserver.js" 
    2. open either a webpage with <current_raspberry_ip:port>, where port is 8080 by default
       or the dyndns (no-ip) host name with port (8080) in any webbrowser
    3. Use the buttons on the index.html or keys, make use of console-logs

## Controls in index.html
Key mapping:

- 40: drive backwards (== number 2 in dpad)  
- 38: drive forwards (== number 8 in dpad)  
- 53: drive full-speed or stop (== number 5 in dpad)  
- 37: steer left (== number 4 in dpad)  
- 39: steer right (== number 6 in dpad)  
<br>

D-Pad:

| | 38: drive forwards <br>(== number 8 in dpad) | |
| ------------- |:-------------:| -----:|
| 37: steer left <br>(== number 4 in dpad) | 53: drive full-speed or stop <br>(== number 5 in dpad) | 39: steer right <br>(== number 6 in dpad) |
| | 40: drive backwards <br>(== number 2 in dpad) | |


## Manifest.json possible Values:
    "display":      ["fullscreen", "standalone", "minimal-ui", "browser"]  
    "orientation":  ["landscape", "portrait"]