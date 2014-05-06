Documentation
=============

Ansible documentation
---------------------

Ansible is a tool to automate tasks execution on remote hosts.

[YAML Syntax] is used to describe all elements of an ansible architecture.

[Jinja2] is used for templating.

[Ansible documentation] is a good place to start.

Ansible terminology
-------------------

### [Inventory] : Infrastructure description files

It is used to declare groups and hosts.

### [Playbook] : Top-level container for deployments

It is used to associate groups to specific roles.

The main plabook, site.yml, includes all other playbooks and is used to deploy a full infrastructure.

### [Role]: List all tasks and variables related to the same feature

There is a role for each OBM component.

### Task: Action to execute on remote hosts

Tasks consists in a large variety of actions like:
  * Launch a command
  * Install a (set of) package(s)
  * Start a service
  * Upload or download a file
  * Set a sysctl parameter
  * ...

Each kind of task is called a [Module].
There is a lot of [included modules] and write our own modules to extend ansible is not really painfull.

Execution of a task can be [conditionned] by success of another task, [delegated] to another host or be [iterated] over a list of elements.

### [Handler]: Task called by its name by another task

We discourage handlers usage because, to be factorised, they are only executed at the end of playbook. If you use site.xml to deploy you infrastructure, they will be all runned at the end of installation wich can cause problems.

### [Variable]: Will I really define what is a variable ?

Variables can be used in [Jinja2] templates but also in all ansible YAML description files.

Directories layout
------------------

The layout we use is described in [Ansible best practices].

Roles detailed documentation will be auto-generated as soon as possible.

<div class="highlight highlight-bash"><pre>
production                <span class="c"># </span><a href="http://docs.ansible.com/intro_inventory.html" title="Inventory">Inventory</a><span class="c"> file for production servers</span>
stage                     <span class="c"># </span><a href="http://docs.ansible.com/intro_inventory.html" title="Inventory">Inventory</a><span class="c"> file for stage environment</span>
dev                       <span class="c"># </span><a href="http://docs.ansible.com/intro_inventory.html" title="Inventory">Inventory</a><span class="c"> file for dev env (toto.example.com)</span>
obm-full                  <span class="c"># </span><a href="http://docs.ansible.com/intro_inventory.html" title="Inventory">Inventory</a><span class="c"> file for obm-full on localhost</span>

group_vars/               <span class="c"># Here we assign variables to particular groups</span>
   all                    <span class="c"># Variables shared by all groups</span>
   webservers             <span class="c"># Variables specifics to the dbservers group</span>
   dbservers              <span class="c"># Variables specifics to the dbservers group</span>
   ...

host_vars/                <span class="c"># Here we assign variables to particular hosts</span>
   localhost              <span class="c"># localhost specific variables (eg. connection=local)</span>
   toto.example.com
   ...

site.yml                  <span class="c"># Master </span><a href="http://docs.ansible.com/playbooks.html" title="Playbook">Playbook</a>
webservers.yml            <span class="c"># </span><a href="http://docs.ansible.com/playbooks.html" title="Playbook">Playbook</a><span class="c"> to manage webservers</span>
dbservers.yml             <span class="c"># </span><a href="http://docs.ansible.com/playbooks.html" title="Playbook">Playbook</a><span class="c"> to manage dbservers</span>
...

collected_files           <span class="c"># Here we store files fetched on hosts (convention)</span>
   toto.example.com       <span class="c"># Files are stored in a directory named like host</span>
      usr/                <span class="c"># Remote path is automatically replicated</span>
         share/
         ...

roles/                    <span class="c"># This hierarchy represents a </span><a href="http://docs.ansible.com/playbooks_roles.html" title="Role">Role</a>
   common/                <span class="c"># Common </span><a href="http://docs.ansible.com/playbooks_roles.html" title="Role">Role</a><span class="c"> used on all hosts</span>

        tasks/            <span class="c"># Here we declare tasks dedicated to this role</span>
            main.yml      <span class="c"># Main tasks file can include smaller files</span>
            ...

        handlers/         <span class="c"># Here we declare handlers dedicated to this role</span>
            main.yml      <span class="c"># Main handlers file can include smaller files</span>
            ...

        templates/        <span class="c"># Here we store files used by template module</span>
            ntp.conf      <span class="c"># Templates can eventually ends with .j2 suffix</span>
            ...

        files/            <span class="c"># Here we store files used by copy module</span>
            bar.txt 

        vars/             <span class="c"># Here we store variables dedicated to this role</span>
            main.yml

        meta/             <span class="c"># Here we store role metadad (eg. dependencies)</span>
            main.yml

    cyrus/                <span class="c"># Same kind of structure as "common" was above, done</span>
    ...                   <span class="c"># for obm-ui role.</span>

</pre></div>

Basic usage
-----------

```.bash
# Deploy all your infrastructure on development environment
$ ansible-playbook -i dev site.xml

# Deploy common configuration on all production hosts
$ ansible-playbook -i production common.yml

# Deploy production obm-ui hosts
# Warning, you need to deploy common configuration on them first
$ ansible-playbook -i production uiservers.yml
```

Scope limitation
----------------

It is possible to limit scope of a particular deployment.

```.bash
# Deploy only production javaservers hosts group
$ ansible-playbook -i production site.xml --groups javaservers

# Deploy only systcl related common configuration on dev hosts
$ ansible-playbook -i dev common.xml --tags sysctl

# Deploy only toto.example.com host
$ ansible-playbook -i dev site.xml --limit toto.example.com
```

Dry run
-------

It is possible to use [Check Mode] to run faked deployments without any change on remote servers.

```.bash
$ ansible-playbook -i dev site.xml --check
```

It also possible to show diffenrences when files are modified.

```.bash
# In check mode
$ ansible-playbook -i dev site.xml --check --diff

# Used by itself
$ ansible-playbook -i dev site.xml --diff
```

Roles reference
---------------

Exhaustive roles documentation will be auto-generated as soon as possible.

Proxy mode
----------

Proxy mode allows you to deploy your OBM infrastructure without internet access on remote hosts.

It can also helps you to work on obm-deploy without internet access (eg. in the train).

Its main role will be to redirect remote repositories to your own computer by hacking their /etc/hosts file.

To make it works, you must follow this steps :

* Ensure that your remote host(s) have access to your computer
* Build a resources directory with [this script] (included in sources)
* Have a fully functional web server and grant it access to resources directory
* Configure needed virtualhosts in your webserver
* Manually install libselinux-python on your remote hosts

Be carefull, to build resources directory an obm-full host needs to be deployed using internet.
It is only required the first time but you need to keep this in mind.

A sample nginx configuration file can be found [here].

[YAML Syntax]: http://docs.ansible.com/YAMLSyntax.html "YAML Syntax"
[Jinja2]: http://docs.ansible.com/playbooks_variables.html "Jinja2"
[Ansible documentation]: http://docs.ansible.com/index.html "Ansible documentation"
[Inventory]: http://docs.ansible.com/intro_inventory.html "Inventory"
[Playbook]: http://docs.ansible.com/playbooks.html "Playbook"
[Role]: http://docs.ansible.com/playbooks_roles.html "Role"
[module]: http://docs.ansible.com/modules.html "module"
[included modules]: http://docs.ansible.com/modules_by_category.html "included modules"
[conditionned]: http://docs.ansible.com/playbooks_conditionals.html "conditionned"
[delegated]: http://docs.ansible.com/playbooks_delegation.html "delegated"
[iterated]: http://docs.ansible.com/playbooks_loops.html "iterated"
[Handler]: http://docs.ansible.com/glossary.html#handlers "handler"
[Variable]: http://docs.ansible.com/playbooks_variables.html "variable"
[Check Mode]: http://docs.ansible.com/playbooks_checkmode.html "Check Mode"
[Ansible best practices]: http://docs.ansible.com/playbooks_best_practices.html "Ansible best practices"
[this script]: ../build-resources-dir.sh "this script"
[here]: examples/nginx_proxy_mode.conf "sample nginx configuration file"
