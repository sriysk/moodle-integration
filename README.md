# Gamifying Moodle (2.9)

This is the source code for the Playlyfe Blog Post Moodle Integration. The tutorial is divided into 3 parts so the source is also divided into 3 parts.
Each tutorial part refers to a branch within this git repository.

You can switch the branches to get to each Part. To checkout the blog post head over to [Playlyfe Blog](https://blog.playlyfe.com)

1. [Part 1](https://blog.playlyfe.com/gamify-moodle-laying-the-base/)
2. [Part 2](https://blog.playlyfe.com/gamify-moodle-adding-dynamic-metrics/)
3. [Part 3](https://blog.playlyfe.com/gamify-moodle-players-and-rules/)

You can see the demo here [moodle playlyfe](https://moodle-playlyfe.rhcloud.com/login/index.php) and the user login details are,

1. `jack@mailinator.com`  
2. `john@mailinator.com`  
3. `doe@mailinator.com`  

and the password is ...... wait for it .... `Test@123` .. please use it wisely.

If you would like to just install the final product then just clone the master repo like this,

`git clone https://github.com/pyros2097/moodle-integration.git`

and use this folder as your moodle src path in setting up [Docker Moodle](https://github.com/playlyfe/docker-moodle).

If you would also like to setup the initial database with admin user and all plugins installed then just do
```bash
playlyfer-4:~❭ sudo docker-enter moodle
root@2632e78200c2:/# mysql moodle < /var/www/html/moodle.sql
```
