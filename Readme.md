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