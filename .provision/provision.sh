# start provisioning
PROVISION_STARTED=`date +%s`
echo "Starting provisioning..."

# test if machine is already provisioned
PROVISIONED="/home/vagrant/.PROVISIONED"
if [[ -f $PROVISIONED ]]; then
    echo "Skipping provisioning. (already provisioned on $(cat $PROVISIONED))"
    exit
fi

# vars for provisioning
PROVISION_FILES="/vagrant/.provision/files"

# set locale
sudo locale-gen de_DE.UTF-8
sudo dpkg-reconfigure --frontend noninteractive locales

# set timezone
echo "Europe/Berlin" | sudo tee /etc/timezone
sudo dpkg-reconfigure --frontend noninteractive tzdata

# update sources, upgrade packages
sudo apt-get -y update
sudo apt-get -y upgrade

# install basics
sudo apt-get -y install build-essential libssl-dev git

# install node.js via nvm
git clone https://github.com/creationix/nvm.git ~/.nvm
cd ~/.nvm
git checkout `git describe --abbrev=0 --tags`
cd ~
source ~/.nvm/nvm.sh
echo "Installing node.js..."
nvm install stable &> /dev/null
nvm use stable
echo "source /home/vagrant/.nvm/nvm.sh && nvm use stable && cd /vagrant" >> ~/.bashrc

# install global node packages
echo "Installing global node.js packages... (please be patient)"
npm install -g npm@latest
npm install -g gulp bower

# install project dependencies and build
cd /vagrant
rm -rf node_modules
mkdir -p ~/node_modules
ln -s ~/node_modules node_modules
echo "Installing local node.js packages... (please be patient)"
npm install

# write provision date to file to avoid reprovisioning
echo "$(date)" > $PROVISIONED

# print provision duration
PROVISION_DURATION=$((`date +%s`-$PROVISION_STARTED))
format_duration() {
    ((h=${1}/3600))
    ((m=(${1}%3600)/60))
    ((s=${1}%60))
    printf "%02d:%02d:%02d\n" $h $m $s
}
echo "Provisioning done after $(format_duration $PROVISION_DURATION)."
