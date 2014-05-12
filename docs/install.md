Installation
============

This documentation wasx inspired by [Oliver Welge's article]

It is known to work with all Linux or BSD Flavors (including OSX).

First, you need to ensure that python2 with virtualenv and pip support is installed on your system.

Python-dev|Python-devel will also be needed on Debian/Ubuntu based distros.

Please refer to your OS documentation.

### Fork the repo using github
I don't need to explain that.

### Clone OBM-Deploy repository
```.bash
$ git clone https://github.com/your_login/obm-deploy
$ cd obm-deploy
```
### Create a virtual environment (please use virtualenv2 in archlinux)
```.bash
$ virtualenv --no-site-packages obm-deploy-env
```

### Create a virtual environment (alternative using virtualenvwrapper)
```.bash
# virtualenvwrapper must be installed on your OS
$ mkvirtualenv -p /usr/bin/python2 --no-site-packages obm-deploy-env
```

### Activate your virtual environment
```.bash
$ source obm-deploy-env/bin/activate
```

### Activate your virtual environment (alternative using virtualenvwrapper)
```.bash
# You must have created your virtualenv with virtualenvwrapper
$ workon obm-deploy-env
```

### Install Ansible requirements
```.bash
$ pip install paramiko PyYAML jinja2 pyasn1 pycrypto python-keyczar==0.71b
```

### Clone Ansible repository
```.bash
$ git clone https://github.com/ansible/ansible -b release1.5.5
```

### Activate Ansible environment
```.bash
$ source ansible/hacking/env-setup
```

### Make virtualenvwrapper to auto-setup ansible (only virtualenvwrapper)
```.bash
# If you only want to setup ansible environment on activation
$ cat > ~/.virtualenvs/obm-deploy-env/bin/postactivate << EOF
#!/bin/bash
source $(pwd)/ansible/hacking/env-setup
EOF

# If you also want to automatically cd in to obm-deploy directory
$ cat > ~/.virtualenvs/obm-deploy-env/bin/postactivate << EOF
#!/bin/bash
cd $(pwd)
source ansible/hacking/env-setup
EOF

$ chmod +x ~/.virtualenvs/obm-deploy-env/bin/postactivate
```

### Install a virtual machine to test deployment
You can use any kind of VM.

Make sure that you have access to it using SSH and user root.

If you want to use our test infrastructure, add this to you /etc/hosts :
```.bash
ip_of_your_vm obm.example.com
```

### Launch deployement of your VM
```.bash
ansible-playbook -i obmfull-example obm.yml
```

### Exit developpement environnement
```.bash
$ deactivate
```

### Next time you need to work with obm-deploy
```.bash
$ cd obm-deploy
$ source obm-deploy-env/bin/activate
$ source ansible/hacking/env-setup
```

### Next time you need to work with obm-deploy (using virtualenvwrapper)
```.bash
$ workon obm-deploy-env
```

[Oliver Welge's article]: https://weluse.de/blog/installing-ansible-on-os-x.html "Oliver Welge's article"
