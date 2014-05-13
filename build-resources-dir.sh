#! /bin/bash
# Launch me from your activated virtualenv
echo "### Install test.example.com ###"
#ansible-playbook -i obmfull-example obm.yml
echo "### Create resources directory ###"
[ -d resources ] || mkdir resources
pushd resources
echo "### Copy yum cache to /root/6 ###"
ssh obm.example.com "cp -r /var/cache/yum/x86_64/6 /root/"
echo "### Create RPM repositories ###"
ssh obm.example.com "find /root/6 -type d -name packages -exec createrepo -q {} \;"
echo "### Sync repos from remote host ###"
rsync -r --delete obm.example.com:/root/6/* rpm-repos
echo "### Copy libselinux-python ###"
if [ ! -f libselinux-python-*.rpm ]; then
    cp ./rpm-repos/base/packages/libselinux-python-2.0.94-5.3.el6_4.1.x86_64.rpm ./
fi
echo "### Download epel-release RPM ###"
if [ ! -f epel-release-6-8.noarch.rpm ]; then
    wget -q http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
fi
echo "### Download Oracle JDK RPM ###"
if [ ! -f jdk-6u45-linux-x64-rpm.bin ]; then
    wget -q http://uni-smr.ac.ru/archive/dev/java/SDKs/sun/j2se/6/jdk-6u45-linux-x64-rpm.bin
fi
echo "### Download obm-release RPM ###"
if [ ! -f obm-release.noarch.rpm ]; then
    wget -q http://packages.obm.org/rpm/25/release/obm-release.noarch.rpm
fi
echo "### Download PG91 repo RPM ###"
if [ ! -f pgdg-centos91-9.1-4.noarch.rpm ]; then
    wget -q http://yum.postgresql.org/9.1/redhat/rhel-6-x86_64/pgdg-centos91-9.1-4.noarch.rpm
fi
popd
echo "### DONE ! ###"
