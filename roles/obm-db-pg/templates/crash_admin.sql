-- Set admin rights on domains for admin0@global.virt --
UPDATE profilemodule SET profilemodule_right = 31 WHERE profilemodule_domain_id = 1 AND profilemodule_profile_id = 1 AND profilemodule_module_name = 'domain';
-- Create an host corresponding to obm-sync --
insert into host (host_domain_id, host_name, host_ip) values (1, '{{ db_host_hostname }}', '{{ hostvars[groups['syncservers'][0]] | get_ip(lan_net) }}');
-- A kind of magic --
insert into entity (entity_mailing) values (true);
-- Create an host entity for this host --
insert into hostentity (hostentity_host_id, hostentity_entity_id) select max(host_id), max(entity_id) from host, entity;
-- Create an obm-sync service --
insert into service (service_service, service_entity_id) select 'sync', max(entity_id) from entity;
-- Associate obm-sync service to newly created host --
insert into serviceproperty (serviceproperty_service, serviceproperty_property, serviceproperty_entity_id, serviceproperty_value) select 'sync', 'obm_sync', domainentity_entity_id, max(host_id) from domainentity inner join domain on domain_id = domainentity_domain_id inner join host on host_domain_id = domain_id group by host_id, domainentity_entity_id;
