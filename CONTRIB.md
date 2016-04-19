## OBM-Deploy contribution workflow 

This is contribution workflow of OBM-Deploy project. You must follow these
rules in order to contribute to this project.


### 1. Create a Jira ticket


This ticket should explain the purpose of the contribution and must provide the following informations :

- Description of the need in BDD style (As a user, I try to ..., As a user, I want to ...)

- Full context (OBM version, deploy version (eg. HEAD), GNU/Linux distribution used, infrastructure type (distributed, obm-full, ...), used inventory, ...

- Description of the encountered problem (Error message - Fonctionnal behaviour) (eg. obm-satellite service doesn't start, postfix maps aren't generated, ...)

- Reproduction conditions (eg. launch ansible-playbook -i inventory obm.yml --tags opush, use a python3 virtualenv, ...)

### 2. Assign the Jira ticket

Assign the newly created ticket to yourself by the **Assign to me** button.

### 3. Track the fact you are working

To start working on this ticket, using the **Start progress** button.

### 4. Fork the obm-deploy repository (only the first time)

- Go to obm-deploy repo.

- Click to **Fork** button to fork the repo.

- Click to **Clone** button and clone the forked repo.

```
$ git clone [the/copied/url]

```

### 5. Refresh local obm-deploy repository (not the first time)

Every time start working with `obm-deploy` you should refresh your local copy
with remote repo:

``` 
$ git checkout master && git fetch && git rebase
```


### 6. Create a branch with the name of the Jira ticket

Each ticket has its own branch to work with:

```
$ git checkout -b DEPLOY-52
```

### 7. Code the fix

### 8. Commit your changes with an appropriate commit message

The commit message must reflect Jira ticket title like in following command :

```
$ git commit -m 'DEPLOY-52 cyrus frontends may not have mupdate process'
```

### 9. Push your code to your remote repository

```
$ git push --set-upstream origin DEPLOY-52
```

### 10. Create Pull Request

Add @achapellon and @tsarboni as reviewers.

### 11. Change ticket status

Go to Jira and chage the ticket status using **Open Code Review** button.

### 12. Close ticket

Go to Jira and close your ticket using **Code review OK** button.
