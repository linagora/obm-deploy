Get involved
------------

If you are interested in hepling us to improve this tool, please follow [this instructions].

Directories layout
------------------

The layout we use is described in [Ansible best practices].

Roles detailed documentation will be auto-generated as soon as possible.

<div class="highlight highlight-bash"><pre>
obmfull-example           <span class="c"># </span><a href="http://docs.ansible.com/intro_inventory.html" title="Inventory">Inventory</a><span class="c"> file for our obm-full obm.example.com.</span>
...                       <span class="c"># You can add your own</span><a href="http://docs.ansible.com/intro_inventory.html" title="Inventory">Inventory</a><span class="c"> file here to fit your needs.</span>

config.yml                <span class="c"># Main obm-deploy configuration file. Please always take a look at it before launching your deployments.</span>

obm.yml                   <span class="c"># OBM main </span><a href="http://docs.ansible.com/playbooks.html" title="Playbook">Playbook</a></span>
                          <span class="c"># We mostly use it to associate roles to groups. You probably don't need to update it.</span>  

group_vars/               <span class="c"># Here we assign variables to particular groups</span>
   all                    <span class="c"># Variables shared by all groups</span>
   webservers             <span class="c"># Variables specifics to the webservers group</span>
   dbservers              <span class="c"># Variables specifics to the dbservers group</span>
   ...

host_vars/                <span class="c"># Here we assign variables to particular hosts</span>
   localhost              <span class="c"># localhost specific variables (eg. connection=local)</span>
   obm.example.com
   ...

collected_files           <span class="c"># Here we store files fetched on hosts (convention)</span>
   obm.example.com       <span class="c"># Files are stored in a directory named like host</span>
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

        meta/             <span class="c"># Here we store role metadata (eg. dependencies)</span>
            main.yml

    cyrus/                <span class="c"># Same kind of structure as "common" was above, done</span>
    ...                   <span class="c"># for obm-ui role.</span>

</pre></div>

[this instructions]: 
[Ansible best practices]: http://docs.ansible.com/playbooks_best_practices.html "Ansible best practices"
