Advanced usage
==============

Scope limitation
----------------

It is possible to limit scope of a particular deployment.

```.bash
# Deploy all ntp tagged tasks on production servers
$ ansible-playbook -i production obm.yml --tags ntp

# Deploy development environment only toto.example.com host
$ ansible-playbook -i dev obm.yml --limit obm.example.com
```

You can found other examples in [Ansible best practices].

Dry run
-------

It is possible to use [Check Mode] to run faked deployments without any change on remote servers.

```.bash
$ ansible-playbook -i obmfull-example obm.yml --check
```

It also possible to show differences when files are modified.

```.bash
# In check mode
$ ansible-playbook -i obmfull-example obm.yml --check --diff

# Used by itself
$ ansible-playbook -i obmfull-example obm.yml --diff
```

Mirror mode
-----------

Mirror mode allows you to deploy your OBM infrastructure without internet access on remote hosts.

It can also helps you to work on obm-deploy without internet access (eg. in the train).

Its main role will be to redirect remote repositories to your own computer by hacking their /etc/hosts file.

To make it works, you must follow this steps :

* Ensure that your remote host(s) have access to your computer
* Build a resources directory with [this script] (included in sources)
* Have a fully functional web server and grant it access to resources directory
* Configure needed virtualhosts in your webserver
* Manually install libselinux-python on remote hosts

* To make your remote machines synced with a time server you need to specify a time server ip in config.yml
  It can be your desktop machine if you work with VMs (eg. in the train).

Be carefull, building resources directory requires a complete obm-full host to sync from.

You can refer to [our documentation] to install our test.example.com test host.

A sample nginx configuration file can be found [here].

[Check Mode]: http://docs.ansible.com/playbooks_checkmode.html "Check Mode"
[Ansible best practices]: http://docs.ansible.com/playbooks_best_practices.html "Ansible best practices"
[this script]: ../build-resources-dir.sh "this script"
[here]: examples/nginx_proxy_mode.conf "sample nginx configuration file"
[our documentation]: install.md "install.md"
