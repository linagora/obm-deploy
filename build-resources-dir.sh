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
if [ ! -f obm-release-2.5-1.noarch.rpm ]; then
    wget -q http://packages.obm.org/rpm/25/release/obm-release-2.5-1.noarch.rpm
fi
echo "### Download PG91 repo RPM ###"
if [ ! -f pgdg-centos91-9.1-4.noarch.rpm ]; then
    wget -q http://yum.postgresql.org/9.1/redhat/rhel-6-x86_64/pgdg-centos91-9.1-4.noarch.rpm
fi
echo "### Create lightning xpi directory ###"
mkdir -p xpi/lightning/tb{24,31}
echo "### Download lightning xpis ###"
lightning_base_url="http://download.obm.org/mozilla-addons/lightning/stable"
wget -qN ${lightning_base_url}/tb24/latest-linux.xpi -O xpi/lightning/tb24/latest-linux.xpi
wget -qN ${lightning_base_url}/tb24/latest-mac.xpi -O xpi/lightning/tb24/latest-mac.xpi
wget -qN ${lightning_base_url}/tb24/latest-windows.xpi -O xpi/lightning/tb24/latest-windows.xpi
wget -qN ${lightning_base_url}/tb31/latest-linux.xpi -O xpi/lightning/tb31/latest-linux.xpi
wget -qN ${lightning_base_url}/tb31/latest-mac.xpi -O xpi/lightning/tb31/latest-mac.xpi
wget -qN ${lightning_base_url}/tb31/latest-windows.xpi -O xpi/lightning/tb31/latest-windows.xpi
echo "### Create obm connector xpi directory ###"
mkdir -p xpi/connector/tb{24,31}
echo "### Download obm connector xpis ###"
connector_base_url="http://download.obm.org/mozilla-addons/obm-connector/stable"
wget -qN ${connector_base_url}/tb24/obm-connector-latest.xpi -O xpi/connector/tb24/obm-connector-latest.xpi
popd
echo "### DONE ! ###"
