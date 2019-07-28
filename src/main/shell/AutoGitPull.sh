#!/bin/sh

# Define a timestamp function
timestamp() {
  date +"%T"
}


 ACTION='\033[1;90m'
 FINISHED='\033[1;96m'
 READY='\033[1;92m'
 NOCOLOR='\033[0m' # No Color
 ERROR='\033[0;31m'

while :; do
    UPSTREAM=${1:-'@{u}'}
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse "$UPSTREAM")
    BASE=$(git merge-base @ "$UPSTREAM")

    if [ $LOCAL = $REMOTE ]; then
        echo $(timestamp) "Up-to-date" 
    elif [ $LOCAL = $BASE ]; then
        echo $(timestamp) "Need to pull"
        git pull
    elif [ $REMOTE = $BASE ]; then
        echo $(timestamp) "Need to push"
    else
        echo $(timestamp) "Diverged"
    fi

if git diff-index --quiet HEAD --; then
    # No changes
    echo "third script managed to find changes"
else
    # Changes
    echo "third script found no changes"
fi


    sleep 1
done
