echo hi &&
git --version &&
cd "/home/pi/Project/RaspberryPi_RC-Car/" &&
git fetch &&
git pull &&
git add . &&
git commit -m "autosaved all changes via chronjob on pi" &&
git push