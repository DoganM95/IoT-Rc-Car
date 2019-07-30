#!/bin/sh

# Define a timestamp function
timestamp() {
  date +"%T"
}
NPMRUN="shellstart"


#start RC-Car Server initially on boot
echo "another run" >> /home/pi/Desktop/ran.txt
cd /home/pi/project/RaspberryPi_RC-Car/
sudo killall node
git fetch
git checkout master
git pull
#sudo npm start &
zenity --info --text "startet server" &
#xterm -e 'bash -c "echo server is up;sleep 10"' &>/dev/null &

#Then start a script to poll and pull on changes and restart server afterwards
#Script will run free from hangups (nohup)
#nohup /home/pi/project/RaspberryPi_RC-Car/src/main/shell/AutoGitPull.sh &
#sudo nohup /home/pi/Project/RaspberryPi_RC-Car/src/main/shell/AutoGitPull.sh >$




#start RC-Car Server initially on boot
echo "another run" >> /home/pi/Desktop/ran.txt
cd /home/pi/project/RaspberryPi_RC-Car/
sudo killall node
git fetch
git checkout master
git pull
#sudo npm start &
sudo npm run $NPMRUN &
zenity --info --text "Startet Server" &
#xterm -e 'bash -c "echo server is up;sleep 10"' &>/dev/null &

#Then start a script to poll and pull on changes and restart server afterwards
#Script will run free from hangups (nohup)
#nohup /home/pi/project/RaspberryPi_RC-Car/src/main/shell/AutoGitPull.sh &
#sudo nohup /home/pi/Project/RaspberryPi_RC-Car/src/main/shell/AutoGitPull.sh >$




cd /home/pi/project/RaspberryPi_RC-Car/
git checkout master

while :; do
    git fetch
    UPSTREAM=${1:-'@{u}'}
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse "$UPSTREAM")
    BASE=$(git merge-base @ "$UPSTREAM")

    if [ $LOCAL = $REMOTE ]; then
        echo $(timestamp) "Up-to-date"
elif [ $LOCAL = $BASE ]; then
        echo $(timestamp) "Pulling changes from remote.."
	sudo killall node
	git pull
	sudo npm run $NPMRUN
    elif [ $REMOTE = $BASE ]; then
        echo $(timestamp) "Pushing local changes to remote.."
	git pull
	git add .
	git commit -m "Automatic push of changes"
	git push
else
        echo $(timestamp) "Diverged"
    fi
    sleep 1
    echo 
done
