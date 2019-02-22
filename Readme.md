# Raspberry Pi Lego RC-Car

FTP:
pi-rc.ddns.net:21

SSH:
pi-rc.ddns.net:22

VNC:
pi-rc.ddns.net:5900


Used Functions:

`servoWrite(pulseWidth)` 

pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500  

Starts servo pulses at 50Hz on the GPIO, 0 (off), 500 (most anti-clockwise) to 2500 (most clockwise). Returns this.
