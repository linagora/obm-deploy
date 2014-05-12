Contributing
============

GIT rules
---------

To contribute to this project, don't push directly to this repository.

Instead, please fork this repository then make pull requests.

Please follow this simple rules for your pull requests :

* Try to always make explicit commit messages in english
* Preffer multiple small atomic commits over a big one
* If an issue already exists concerning you request, indicate it in your commit

__If you are a GIT beginner and need advises, please follow [our guide]__.

Ansible rules
-------------

### Syntax

We don't use specific syntax rules, but, for clarity, try to follow this recommendations :

* Services names and OBM module names a in CamelCase
* When using changed state tracking, variables, by default, are called command_result

### Grammar

* A task must have a name
* A task must have at least a tag
* Tags represent the role or, if role is common, a functionnality
* Command module is better than shell module
* Using a module is better than using a command
* Beware of flushing handlers when they are needed by other tasks

### Variables

* Variables are written in lowercase and use underscores to separate words
* If your variable is a configuration key, place it in group_vars/all
* If your variable is specific to a group and will never been update by users, place it in group_vars/your_group
* If your variable is specific to a role and will never been update by users, place it role/you_role/vars

Bug Report
----------

To make our lives better, respect following rules before creating a new issue :

* Ensure you followed our [installation procedure]
* Be sure that all dependencies for your role are satisfied (common ?)
* Be sure your problem can be reproduced and indicate how we can do it
* Provide us all usefull infos about your environment (inventory file, configuration variables, ...)

Support
-------

If you need support, please use [OBM mailing-list].

[installation procedure]: docs/install.md "installation procedure"
[our guide]: docs/git_guide.md "our guide"
[OBM mailing-list]: http://list.obm.org/mailman/listinfo/obm "OBM mailing-list"
