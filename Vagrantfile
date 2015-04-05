# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    config.vm.box = "ubuntu/trusty64"
    config.vm.network "forwarded_port", guest: 8080, host: 8888
    config.vm.network "forwarded_port", guest: 35729, host: 35729
    config.vm.network "private_network", ip: "10.0.0.5"
    config.ssh.private_key_path = "~/.ssh/id_rsa"
    config.ssh.forward_agent = true
    config.vm.provider :virtualbox do |vb|
        vb.customize ['modifyvm', :id, '--natdnshostresolver1', 'on']
    end
    config.vm.provision "shell", path: ".provision/provision.sh", privileged: false
end

