OBM-Deploy
==========

Ansible based Open Business Management deployment tool

 _OBM Installations made easy_

Disclaimer
----------

At the moment, this tool is more a proof of concept than anything else.

We discourage you to use in anything related to production environment.

Neither Linagora SA nor OBM devs will give you any kind of support
related to usage of this tool in real conditions.

Objectives
----------

 * Reduce cost of OBM installations
 * Make OBM installations standardised
 * Allow developpers to quickly build a developpement environnement
 * Separate configuration management from packaging
 * Improve continuous integration

Current Status
--------------

 * Only CentOS/RHEL 6 is supported
 * Following roles can be installed using ansible :
    - Tomcat based Java webapps : OBM-Sync, OBM-Solr, OBM-Autoconf
    - Jetty based Java webapps : OBM-Locator
    - PHP based webapps : OBM-UI
    - Perl based webapp : OBM-Satellite
    - OpenLDAP directory
    - PostgreSQL database
    - OBM CA and certificates management

Dreamed features
----------------

 * Corosync / Pacemaker
 * PostgreSQL Streaming Replication / PGPool
 * OpenLDAP Sync Replication
 * Better OBM database updates management
 * Auto-generated documentation
 * ... More will come :-)

Documentation
-------------

 * [About ansible](docs/ansible.md "ansible.md")
 * [Installation](docs/install.md "install.md")
 * [Quick start](docs/quickstart.md "quickstart.md")
 * [Roles reference](docs/roles.md "roles.md")
 * [Advanced usage](docs/advanced.md "advanced.md")
 * [Development](docs/development.md "development.md")

