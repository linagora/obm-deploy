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

Execution of a task can be [conditonned] by success of another task, [delegated] to another host or be [iterated] over a list of elements.

### [Handler]: Task called by its name by another task

We discourage handlers usage because, to be factorised, they are only executed at the end of playbook. If you use site.xml to deploy you infrastructure, they will be all runned at the end of installation wich can cause problems.

### [Variable]: Will I really define what is a variable ?

Variables can be used in [Jinja2] templates but also in all ansible YAML description files.

Directories layout
------------------

The layout we use is described in [Ansible best practices].

Roles detailed documentation will be auto-generated as soon as possible.

```.bash
production                # [Inventory] file for production servers
stage                     # [Inventory] file for stage environment
dev                       # [Inventory] file for dev env (toto.example.com)
obm-full                  # [Inventory] file for obm-full on localhost

group_vars/               # Here we assign variables to particular groups
   all                    # Variables shared by all groups
   webservers             # Variables specifics to the dbservers group
   dbservers              # Variables specifics to the dbservers group
   ...

host_vars/                # Here we assign variables to particular hosts
   localhost              # localhost specific variables (eg. connection=local)
   toto.example.com
   ...

site.yml                  # Master [Playbook]
webservers.yml            # [Playbook] to manage webservers
dbservers.yml             # [Playbook to manage dbservers
...

collected_files           # Here we store files fetched on hosts (convention)
   toto.example.com       # Files are stored in a directory named like host
      usr/                # Remote path is automatically replicated
         share/
         ...

roles/                    # This hierarchy represents a [Role]
   common/                # Common [Role] used on all hosts

        tasks/            # Here we declare tasks dedicated to this role
            main.yml      # Main tasks file can include smaller files
            ...

        handlers/         # Here we declare handlers dedicated to this role
            main.yml      # Main handlers file can include smaller files
            ...

        templates/        # Here we store files used by template module
            ntp.conf      # Templates can eventually ends with .j2 suffix
            ...

        files/            # Here we store files used by copy module
            bar.txt 

        vars/             # Here we store variables dedicated to this role
            main.yml

        meta/             # Here we store role metadad (eg. dependencies)
            main.yml

    cyrus/                # Same kind of structure as "common" was above, done
    ...                   # for obm-ui role.

```

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

[Check Mode] dry run
-------

It is possible to run faked deployments without any change on remote servers.

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
[Ansible best practices]: http://docs.ansible.com/playbooks_best_practices.html "Ansible best practices"

