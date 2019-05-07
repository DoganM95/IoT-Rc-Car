echo hi &&
git --version &&
PROJECT_PATH="/home/pi/Project/RaspberryPi_RC-Car/" &&
echo $PROJECT_PATH &&
git fetch $PROJECT_PATH &&
git pull $PROJECT_PATH &&
git add $PROJECT_PATH &&
git commit -m "autosaved all changes via chronjob on pi" &&
git push 