# article processor Service
article processor Service

## Platform & Database Information
Framework <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;**Node.js Version: 14.16.1 LTS** <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;**Express Version: 4.17.1** <br/><br/>
RDBMS <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;**PostgreSQL Version: PostgreSQL 11.12 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 8.4.1 20200928 (Red Hat 8.4.1-1), 64-bit** <br/><br/>
NoSQL <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;**MongoDB Version:4.2.14** <br/><br/>
Cache <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;**REDIS Server Version:6.0.14**
  
## Prerequisites
&nbsp;&nbsp;&nbsp;&nbsp;Before running article processor Service PostgreSQL & MongoDB setup has to be completed.

## Soruce Build & Run Commands
&nbsp;&nbsp;&nbsp;&nbsp;Please use below command to run the source.
&nbsp;&nbsp;&nbsp;&nbsp;Default server port is 9090.
```
npm start
```

&nbsp;&nbsp;&nbsp;&nbsp;Please use below command to build the source for production.
```
npm run build
```

&nbsp;&nbsp;&nbsp;&nbsp;Please use below command to run the article processor Service in Production
```
node run ./build/server.js
```

## Docker Deployment
&nbsp;&nbsp;&nbsp;&nbsp;This is supported for dockerization.
&nbsp;&nbsp;&nbsp;&nbsp;Please use below command to create the docker image.
```
docker build -t squareposservice .
```

&nbsp;&nbsp;&nbsp;&nbsp;After docker image creation successful, use below command to run the docker image in normal mode.
```
docker run --name squareposservice  -p 9090:9090 squareposservice
```

&nbsp;&nbsp;&nbsp;&nbsp;Use below command to run the docker image in deamon mode.
```
docker run --name squareposservice -d -p 9090:9090 squareposservice
```

## Github Code Rebase
&nbsp;&nbsp;&nbsp;&nbsp; Navigate to respective github repository and its branch in command prompt and then follow the below commands to rebase the branch.

&nbsp;&nbsp;&nbsp;&nbsp; `hashOfCommit` is the version to which we are planning to rebase the code.

```
git reset --hard hashOfCommit
```


&nbsp;&nbsp;&nbsp;&nbsp; `branchName` is the name of branch to which we want to rebase the code.
```
git push -f origin hashOfCommit:branchName`
```

## Authors
Balakrishna V: [v.balakrishna@solu-m.com](mailto:v.balakrishna@solu-m.com)<br/><br/>
Mayank Soni: [mayank.soni@solu-m.com](mailto:mayank.soni@solu-m.com)<br/><br/>
Monik Raj: [monikraj.a@solu-m.com](mailto:monikraj.a@solu-m.com)<br/><br/>
Adarsha Nayak: [adarsha.nayak@diatoz.com](mailto:adarsha.nayak@diatoz.com)<br/><br/>
