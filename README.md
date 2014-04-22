#OBM-Deploy
Obm-deploy is a tool to facilitate and automate the obm deploy on a server.

##The aim goal
This tool let install an obm-full or a distributed obm 

### Content organization
We choose the following layout to organize the playbook contents : 

``` 
production                # inventory file for production servers
stage                     # inventory file for stage environment
group_vars/
   group1                 # here we assign variables to particular groups
   group2                 # ...
host_vars/
   hostname1              # if systems need specific variables, put them here
   hostname2              # ...
site.yml                  # master playbook
webservers.yml            # playbook for webserver tier
dbservers.yml             # playbook for dbserver tier

roles/
    common/               # this hierarchy represents a "role"
        tasks/            #
            main.yml      #  <-- tasks file can include smaller files if warranted
        handlers/         #
            main.yml      #  <-- handlers file
        templates/        #  <-- files for use with the template resource
            ntp.conf.j2   #  <------- templates end in .j2
        files/            #
            bar.txt       #  <-- files for use with the copy resource
            foo.sh        #  <-- script files for use with the script resource
        vars/             #
            main.yml      #  <-- variables associated with this role
        meta/             #
            main.yml      #  <-- role dependencies
        scripts/          #
            my_scripts    #  <-- script files


    cyrus/                # same kind of structure as "common" was above, done for the cyrus role
    postgres/             # same kind of structure as "common" was above, done for the postgres role
    postfix/              # same kind of structure as "common" was above, done for the postfix role
    
```

### Work in Progress
Experimental Ansible-based deployment system.
Only works on CentOS for now.
