#!/bin/sh

# Definition of general stuff
readonly terminalSessionName="rc-car"
readonly username="pi"
readonly tempNodeDir="/home/$username/node_download"
readonly sleepDurationBetweenGitFetches=5

# Definition of device specs
readonly deviceType="raspberry pi"
readonly armVersion=$(uname -a | grep -i -E -o "armv[0-9]+")

# Definition of project dependencies
readonly projectPath="/home/$username/project"
readonly softwarePath="$projectPath/RaspberryPi/Software"
readonly sourceCodePath="$softwarePath/src/main"
readonly projectRepository="https://github.com/DoganM95/IoT-Rc-Car.git"

# Git settings
readonly workingBranch="master"

# Log Settings
readonly maxLogLines=1000
