Vagrant.configure("2") do |config|

  ## VM definition
  config.vm.define "obm.example.com" do |centos66|
    centos66.vm.box = "centos66"
    centos66.vm.hostname = "obm.example.com"
    centos66.vm.network :private_network,
                        :ip => "192.168.56.201"

    ## Shell script provisionning
    centos66.vm.provision "shell" do |shell|
      shell.path = "vagrant/bootstrap.sh"
    end

    ## Ansible/obm-deploy provisionning
    centos66.vm.provision :ansible do |ansible|
      ansible.inventory_path = "obmfull-example"
      ansible.playbook = "obm.yml"
      ansible.extra_vars = { ansible_ssh_user: 'root' }
      # Disable default limit (required with Vagrant 1.5+)
      ansible.limit = 'all'
    end

  end

  ## synced folder configuration
  config.vm.synced_folder "vagrant/pubkeys", "/pubkeys", type: "rsync"

end
