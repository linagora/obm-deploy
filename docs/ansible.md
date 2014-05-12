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

Handlers are tasks wich are called by other tasks, on if they implies a change (eg. restart a service after updating configuration).

It simplifies tasks order mangement but beware, by default, they are only executed at the end of playbook.

If you want them to be launched earlier, you need to explicitly flush them.

### [Variable]: Will I really define what is a variable ?

Variables can be used in [Jinja2] templates but also in all ansible YAML description files.

[YAML Syntax]: http://docs.ansible.com/YAMLSyntax.html "YAML Syntax"
[Jinja2]: http://docs.ansible.com/playbooks_variables.html "Jinja2"
[Ansible documentation]: http://docs.ansible.com/index.html "Ansible documentation"
[Inventory]: http://docs.ansible.com/intro_inventory.html "Inventory"
[Playbook]: http://docs.ansible.com/playbooks.html "Playbook"
[Role]: http://docs.ansible.com/playbooks_roles.html "Role"
[Module]: http://docs.ansible.com/modules.html "module"
[included modules]: http://docs.ansible.com/modules_by_category.html "included modules"
[conditionned]: http://docs.ansible.com/playbooks_conditionals.html "conditionned"
[delegated]: http://docs.ansible.com/playbooks_delegation.html "delegated"
[iterated]: http://docs.ansible.com/playbooks_loops.html "iterated"
[Handler]: http://docs.ansible.com/glossary.html#handlers "handler"
[Variable]: http://docs.ansible.com/playbooks_variables.html "variable"
