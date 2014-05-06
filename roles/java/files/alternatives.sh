#!/bin/sh

version="$1"

before=$(ls -l /etc/alternatives/ |grep jdk${version} |wc -l)

/usr/sbin/alternatives --install /usr/bin/java java /usr/java/jdk${version}/jre/bin/java 20000
/usr/sbin/alternatives --install /usr/bin/javaws javaws /usr/java/jdk${version}/jre/bin/javaws 20000
/usr/sbin/alternatives --install /usr/bin/javac javac /usr/java/jdk${version}/bin/javac 20000
/usr/sbin/alternatives --install /usr/bin/jps jps /usr/java/jdk${version}/bin/jps 20000


/usr/sbin/alternatives --install /usr/lib/jvm/java java_sdk /usr/java/jdk${version}/ 20000
/usr/sbin/alternatives --install /usr/lib/jvm/jre jre /usr/java/jdk${version}/jre/ 20000

after=$(ls -l /etc/alternatives/ |grep jdk${version} |wc -l)


if [[ "$after" -ge 6 ]]; then
    if [[ "$before" -eq "$after" ]]; then
        echo "OK"
        exit 0
    else
        echo "CHANGED"
        exit 0
    fi
else
    echo "FAILED"
    exit 1
fi
