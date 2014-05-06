#! /bin/bash
# Launch me from your activated virtualenv
ansible -i dev site.xml
[ -d resources ] || mkdir resources
pushd resources
ssh toto.example.com "cp -r /var/cache/yum/x86_64/6 /root/"
ssh toto.example.com "find /root/6 -type d -name packages -exec createrepo {} \;"
rsync -r --delete toto.example.com:/root/6/* rpm-repos
cp ./rpm-repos/base/packages/libselinux-python-2.0.94-5.3.el6_4.1.x86_64.rpm ./
wget http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
wget http://uni-smr.ac.ru/archive/dev/java/SDKs/sun/j2se/6/jdk-6u45-linux-x64-rpm.bin
wget http://packages.obm.org/rpm/25/release/obm-release.noarch.rpm
wget http://yum.postgresql.org/9.1/redhat/rhel-6-x86_64/pgdg-centos91-9.1-4.noarch.rpm
popd
