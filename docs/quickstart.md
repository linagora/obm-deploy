Quick Start
===========

Basic usage
-----------

To use any of this commands, you need to have ssh root acces to hosts you set up in inventory files.

```.bash
# Deploy obm-full on our development environment
$ ansible-playbook -i obmfull-example obm.yml

# Deploy production environment using your own inventory file 'production'
$ ansible-playbook -i production obm.yml