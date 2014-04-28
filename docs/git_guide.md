GIT Guide
=========

Detailed GIT workflow
---------------------

Here are the essentials steps of our GIT workflow :

### Follow [installation instructions]

### Read [contributing instructions]

### Add upstream repository to be able to refresh your fork
```.bash
$ cd directoy/where/you/clone/repo
$ git remote add upstream https://github.com/linagora/obm-deploy
```

### Refresh your fork
```.bash
# Be sure you have no unstaged changes
$ git fetch
$ git checkout master
$ git rebase upstream master
```

### Create a branch and select it
```.bash
$ git branch feature_name
$ git checkout feature_name
```

### Code your feature and commit your changes
```.bash
# If your commit is related to an issue please ad #issue_number to your commit message
$ git commit -m "#n your commit message"
```

### Push your branch to your repository
```.bash
$ git push
```

### Create a pull-request on github

Git tips and tricks
-------------------

### What can i use to test my markdown files without pushing it ?

* retext
* haroopad

### I want to show only last three logs entry
```.bash
$ git log -3
```

### My last commit is buggy, i want to modify it before pushing
```.bash
# Get hash of your last commit
$ git log -1
# Reset your commit
$ git reset commit_hash
# update files then re-commit
$ git commit -m "commit message"
```

### My last commit is really buggy and i want to delete it
```.bash
# Get hash of your last commit
$ git log -1
# Warning, this cannot be reverted
$ git reset --hard commit_hash
```

### I began to work on a branch but master has been update and i want to sync
```.bash
# Check last objects from github
$ git fetch
# Sync your master branch
$ git checkout master
$ git rebase upstream master
# Checkout your branch
$ git checkout your_branch
# Check you don't have unstaged changes than sync your branch
$ git rebase master
```

### I haven't follow your recommendations i have a lot of commits to merge on master branch
```.bash
# Check last objects from github
$ git fetch
# Sync your master branch
$ git checkout master
$ git rebase upstream master
# Create a new branch to handle the first functionnality
$ git branch your_branch
# Reset all commits you made not related to this branch
$ git log
$ git reset firt_commit_hash
$ git reset second_commit_hash
...
# When it remains only commits related to your functionnality, you can push
$ git push
```

### I have made a lot of commits for the same functionnality and i want to merge them
```.bash
# Example if commits you want to merge are the last three ones
$ git rebase -i HEAD~3
# You will be prompted for what you want to do with them
```

To go further
-------------

[GIT reference]

[installation instructions]: https://github.com/linagora/obm-deploy/blob/master/INSTALL.md "installation instructions"
[contributing instructions]: https://github.com/linagora/obm-deploy/blob/master/CONTRIBUTING.md "contributing instructions"
[GIT reference]: http://git-scm.com/docs "GIT reference"

