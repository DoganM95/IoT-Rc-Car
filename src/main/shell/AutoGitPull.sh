#!/bin/sh

# Define a timestamp function
timestamp() {
  date +"%T"
}


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
        git pull
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
