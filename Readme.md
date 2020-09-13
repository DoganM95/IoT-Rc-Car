# IoT-RC_Car-Universal
This project is intended to host a node.js app on a raspberry pi  which replaces the stock internals of a Lego RC car and controls it over http protocol. The car which this was build in is LEGO Racers 8676.


# Setting up a Raspberry Pi (Headless!)
1. Install "Raspbian Lite" on micro-sd card using either "BalenaEtcher" (portable) or "Raspberry Pi Imager" (needs installation)
2. Navigate to "boot" drive, create a new empty file and rename it to `ssh`
3. Create a new file, name it `wpa_supplicant.conf` and edit its content to the following:
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
 ssid="NetworkName"
 psk="NetworkPassword"
}
```  
where `NetworkName` is the destination SSID and `NetworkPassword` is the SSID's password.  

4. Put the SD card into the Pi and boot it up
5. Find the local IP-Address of the Pi (different tools available, e.g. "arp-scan" in Windows-CMD, or "Fing" app in Android)
6. Connect to the Pi using ssh.  
`ssh pi@192.168.0.10` (replace with your Pi's IP), standart password is raspberry
7. Configure Pi:  
`sudo raspi-config`  
Change password and other optional settings and re-login via ssh
1. Create an SSH key for each account (pi and root):  
`ssh-keygen -t rsa -b 4096 -C "youremail@yourdomain.com"`
-> SSH key for account Pi is now created  
`sudo ssh-keygen -t rsa -b 4096 -C "youremail@yourdomain.com"`
-> SSH key for account root is now created  
8. Register the keys in github:  
`cat /home/pi/.ssh/id_rsa.pub` -> this will print your public key for user pi, copy and navigate to 
https://github.com/settings/keys -> "New SSh Key" Button, then paste (without email-part) and save.  
`sudo cat /root/.ssh/id_rsa.pub` -> this will print your public key for user root, copy again, paste in new github key and save.
9. install git:  
`sudo apt update && sudo apt install git && git --version`
9. Clone repository via SSH:
Go to Repository's web interface, click clone, copy the ssh-cloning link and  
`git clone <Repo-link>`
10. Add permissions:  
`sudo chmod -R +rwx IoT-RC_Car-Universal`
11. Run initializer script (Needs user interaction for github credentials)  
`sudo /home/pi/IoT-RC_Car-Universal/RaspberryPi/Software/src/main/shell/init.sh`
12. Remove old Folder:  
`sudo rm -r /home/pi/IoT-RC_Car-Universal`
