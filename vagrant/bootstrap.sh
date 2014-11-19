#! /bin/bash

uname -a

echo " * Setting root password"
sudo su - root -c 'echo l1n@gorA | passwd root --stdin'

echo " * Creating /root/.ssh directory"
sudo su - root -c '[ ! -d /root/.ssh ] && mkdir /root/.ssh'

echo " * Adding synchronized ssh keys"
for file in `sudo su - root -c "ls /pubkeys/*.pub"`; do
    cat $file >> /root/.ssh/authorized_keys
done

echo " * Enabling ssh root login"
sudo su - root -c "sed -i '/^PermitRootLogin\ no/d' /etc/ssh/sshd_config"
sudo su - root -c "sed -i '/^DenyUsers\ root/d' /etc/ssh/sshd_config"
sudo su - root -c "sed -i '/^GSSAPIAuthentication\ yes/d' /etc/ssh/sshd_config"
sudo su - root -c "/etc/init.d/sshd restart"

if [ $# -eq 2 ]; then
    echo " * Change default gateway"
    sudo su - root -c "ip route replace default via $1 dev $2"
fi

echo " * Done"
