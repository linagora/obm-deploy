{% if mupdate_server == "" %}-- {% endif %}INSERT INTO UserSystem (usersystem_login,usersystem_password,usersystem_uid,usersystem_gid,usersystem_homedir,usersystem_lastname,usersystem_firstname,usersystem_shell) VALUES ('{{ mupdate_user }}','{{ mupdate_pass }}','202','8','/','Cyrus','Murder','/bin/false');
