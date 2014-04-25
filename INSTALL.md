Installation
============

First, you need to ensure that python2 with virtualenv and pip support is installed on your system. Please refer to your OS documentation.

Clone OBM-Deploy repository
```.bash
$ git clone https://github.com/linagora/obm-deploy
$ cd obm-deploy
```
Create a virtual environment (virtualenv2 for archlinux)
```.bash
$ virtualenv --no-site-packages obm-deploy-env
```
Activate your virtual environment
```.bash
$ source obm-deploy-env/bin/activate
```
Install Ansible requirements
```.bash
$ pip install paramiko PyYAML jinja2 pyasn1 pycrypto python-keyczar==0.71b
```
Clone Ansible repository
```.bash
$ git clone https://github.com/ansible/ansible -b release1.5.5
```
Activate Ansible environment
```.bash
$ source ./hacking/env-setup
```
Make virtualenvwrapper to automatically setup ansible (_optional_)
```.bash
# virtualenvwrapper must be installed on your OS
$ cat > ~/.virtualenvs/obm-deploy-env/bin/postactivate << EOF
#!/bin/bash
source $(pwd)/ansible/hacking/env-setup
EOF
$ chmod +x ~/.virtualenvs/obm-deploy-env/bin/postactivate
```
