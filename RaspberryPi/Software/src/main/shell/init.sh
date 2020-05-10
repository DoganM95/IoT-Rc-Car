#!/bin/sh

# Load config file
. ./config.sh

# --------------------------------------------------
# Precautious cleanup
# --------------------------------------------------
rm -r $tempNodeDir # delete any existing node temp dir
rm -r $projectPath # delete any existing node temp dir

# update existing apt packages
apt update && apt -y upgrade

# --------------------------------------------------
# install Git
# --------------------------------------------------
echo "\e[30;48;5;82mInstalling Git... \e[0m"
apt install -y git && echo "Done. Installed Git $(git --version)"

# --------------------------------------------------
# Install Node.js
# --------------------------------------------------
echo "\e[30;48;5;82mInstalling Node.js... \e[0m"
mkdir $tempNodeDir
cd $tempNodeDir
echo "Downloading latest node.js..."
wget "https://nodejs.org/dist/latest/$(curl https://nodejs.org/dist/latest/ | grep -E -o "<.*$(uname -a | grep -i -E -o "armv[0-9]+").*\">" | grep -i -o "node.*$(uname -a | grep -i -E -o "armv[0-9]+").*\.gz")" # download most recent nodejs for current device's ARM CPU achitecture from node.js website

# unpack donwloaded archive
echo "Unpacking downloaded node.js archive..."
tar -xzf $(ls | grep "node.*$(uname -a | grep -i -E -o "armv[0-9]+").*\.gz") && echo "Done."

# copy files to system
echo "Copying node binaries to system..."
cp -Rf $(ls -F | grep \/ | grep "node.*$(uname -a | grep -i -E -o "armv[0-9]+").*")/* /usr/local/ && echo "Done. Installed Node.js $(node --version) and NPM $(npm --version)"

# cleanup (deleted downloaded files)
echo "Deleting temporary folder $tempNodeDir ..."
rm -r $tempNodeDir && echo "Done."

# --------------------------------------------------
# Pull project files from remote repository
# --------------------------------------------------
echo "\e[30;48;5;82mPulling files from remote repository... \e[0m"
echo "Deleting previous project directory..."
rm -r $projectPath
echo "Done."

mkdir $projectPath
cd $projectPath

echo "Cloning $projectRepository into local folder $projectPath ..."
git config credential.helper store # save git credentials
while true; do
    git clone --branch $workingBranch $projectRepository $projectPath && break
    # git clone git@github.com:DoganM95/IoT-RC_Car-Universal.git $projectPath && break
    sleep 1
done
git config credential.helper store # save git credentials

# Setting permissions
echo "\e[30;48;5;82mSetting permissions and env variables... \e[0m"
chown -R pi $projectPath
chmod -R +rwx $projectPath

# switch to working branch (gives a nice output)
echo "Switching to working branch"
git checkout $workingBranch

# install node modules
echo "Installing npm packages"
sudo npm install --prefix $softwarePath

# Create environmental variable as shortcut
export projectRoot=$softwarePath
set | grep "projectRoot"

echo "Done."

echo "\e[92mScript finished."
