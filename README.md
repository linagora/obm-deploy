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
 * Foolowing roles can be installed using ansible :
    - Tomcat based Java webapps : OBM-Sync, OBM-Solr
    - Jetty based Java webapps : OBM-Locator
    - PHP based webapps : OBM-UI
    - Perl based webapp : OBM-Satellite
    - OpenLDAP directory
    - PostgreSQL database
    - OBM CA and certificates management
    - ... More will come

Dreamed features
----------------

 * Corosync / Pacemaker
 * PostgreSQL Streaming Replication / PGPool
 * OpenLDAP Sync Replication
 * Better OBM database updates management
 * Auto-generated documentation
 * ... More will come :-)

Installation
------------

Please refer to [Install.md] to show installation instructions for this project.

Documentation
-------------

Please refer to [docs/index.md] to show full documentation for this project.

Get involved
------------

Please refer to [Contributing.md] to show how to contribute to this project.

[Install.md]: INSTALL.md "Install.md"
[docs/index.md]: docs/index.md "docs/index.md"
[Contributing.md]: CONTRIBUTING.md "Contributing.md"

