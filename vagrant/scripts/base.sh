export DEBIAN_FRONTEND=noninteractive
DBPASSWD=test123
sudo apt-get update -y
sudo apt-get install -y debconf-utils curl

#Install Node
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential software-properties-common

#Install Mongo & Maria
#sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
#echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
#sudo apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xcbcb082a1bb943db
#sudo add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://mirror.aarnet.edu.au/pub/MariaDB/repo/10.1/ubuntu trusty main'
#echo "phpmyadmin phpmyadmin/dbconfig-install boolean true" | debconf-set-selections
#echo "phpmyadmin phpmyadmin/app-password-confirm password $DBPASSWD" | debconf-set-selections
#echo "phpmyadmin phpmyadmin/mysql/admin-pass password $DBPASSWD" | debconf-set-selections
#echo "phpmyadmin phpmyadmin/mysql/app-pass password $DBPASSWD" | debconf-set-selections
#echo "phpmyadmin phpmyadmin/reconfigure-webserver multiselect apache2" | debconf-set-selections
#sudo debconf-set-selections <<< "mariadb-server-10.0 mysql-server/root_password password $DBPASSWD"
#sudo debconf-set-selections <<< "mariadb-server-10.0 mysql-server/root_password_again password $DBPASSWD"
#sudo apt-get update
#sudo apt-get install -y mongodb-org mariadb-server phpmyadmin

