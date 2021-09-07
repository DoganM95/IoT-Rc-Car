# IoT-RC_Car-Universal
This project is intended to host a node.js app on a raspberry pi  which replaces the stock internals of a Lego RC car and controls it over http protocol. The car which this was build in is LEGO Racers 8676.

# Initial headless setup
- Install [Raspberry Pi OS Lite](https://www.raspberrypi.org/software/operating-systems/) on micro-sd card using either [BalenaEtcher](https://www.balena.io/etcher/) or [Raspberry Pi Imager](https://www.raspberrypi.org/software/)
- Navigate to `boot` drive
- Create an empty file and rename it to `ssh`
- Create an empty file, name it `wpa_supplicant.conf` and edit its content to the following:
  ```
  ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
  update_config=1
  network={
   ssid="NetworkName"
   psk="NetworkPassword"
  }
  ```  
  where `NetworkName` is the destination SSID and `NetworkPassword` is the SSID's password.  
- Insert the SD card into the Pi and boot it up  
- Find the local IP-Address of the Pi (different tools available), e.g.  
  - `arp-scan` in Windows-CMD  
  - `nmap` in Linux-Shell  
  - `Fing` as Android App  
- Connect to the Pi: `ssh pi@192.168.x.x` (replace with your Pi's IP), standart password is raspberry  
- Configure Pi: `sudo raspi-config`  
- Change password and other optional settings and re-login via ssh
- Create an SSH key for each user  
  - for **pi**: `ssh-keygen -t rsa -b 4096 -C "youremail@yourdomain.com"`  
  - for **root** `sudo ssh-keygen -t rsa -b 4096 -C "youremail@yourdomain.com"`  
- Register the keys for each user (pi && root) in github:  
  - print key: `cat /home/pi/.ssh/id_rsa.pub`
  - copy and navigate to https://github.com/settings/keys  
  - Click "New Ssh Key", paste (without email-part) and save  
- Install git: `sudo apt update && sudo apt install git && git --version`
- Clone repository via SSH: `git clone <repo_link>`  
- Add permissions: `sudo chmod -R +rwx IoT-RC_Car-Universal`  
- Run initializer script (Needs interaction for github creds):  
`sudo /home/pi/IoT-RC_Car-Universal/RaspberryPi/Software/src/main/shell/init.sh`
- Remove old folder: `sudo rm -r /home/pi/IoT-RC_Car-Universal`
