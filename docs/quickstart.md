Quick Start
===========

Basic usage
-----------

To use any of this commands, you need to have ssh root access to hosts you set up in inventory files.

```.bash
# Deploy obm-full on our development environment
$ ansible-playbook -i obmfull-example obm.yml

# Deploy production environment using your own inventory file 'production'
$ ansible-playbook -i production obm.yml

Sudo
----

It's possible to acces your remote hosts using other user than root and then use sudo to gain root access.

To do that, you need to change `remote_user` directive in ansible.cfg.

Ensure that your user is created and added to /etc/sudoers on your remote machines.

