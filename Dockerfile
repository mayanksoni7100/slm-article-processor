################# Docker Image Creation Steps ######################
# 1. Create docker image
#       docker build -t slm-article-processor-service:1.0.0 .
# 2. Check generated docker image
#       docker images
# 3. Run your docker image (Will be run in Daemon mode)
#       docker run -d -p <new port>:3000 slm-article-processor-service
#
#       Run Docker Image with inline Environement Variables.
#       Example-1: docker run --name slm-article-processor-service  -p 8008:8008 slm-article-processor-service
#       Example-2: docker run --name slm-article-processor-service -d  -p 8008:8008 slm-article-processor-service:v1
#
#
# 4. To See Docker Image Contents
#   docker run -it --entrypoint sh <image name>
# 5. Use this Command to go inside docker container
#   docker exec  -ti <container-name> "/bin/bash"
#
# 6. Connect Docker Container using SSH
#       ssh solum@52.231.53.34
#       Password: blackforest@123
# 7. Use below commands to tail the logs
#    sudo su -
#   cd /home/solum/dev
#
####################################################################

######################### PUSHING DOCKER IMAGE TO AZURE ############
# 1. Install Azure Cli
# 2. Login into Azure Cli using below command
#       az login -u admin@solumpro1.onmicrosoft.com -p SoluM@2020
# 3. Login into Azure Container Registries. Using Below Command
#       az acr login --name solumContainerRegistryDev
# 4. Tag the created docker image using below command
#       docker tag slm-article-processor-service:v1 solumcontainerregistrydev.azurecr.io/slm-article-processor-service_img:v1
# 5. Push Docker Image to Azure
#       docker push solumcontainerregistrydev.azurecr.io/slm-article-processor-service_img:v1
# 6. Pull Docker Container Where ever you want to run
#       docker pull solumcontainerregistrydev.azurecr.io/slm-article-processor-service_img:v1
# 7. Run Docker image using below command
#       docker run  --name slm-article-processor-service -d -ti -p 8008:8008 solumcontainerregistrydev.azurecr.io/slm-article-processor-service_img:v1
####################################################################



# From Docker Image (Previous Version Node LTS 12.18.1, Linux Alpine(3.11) latest release)
FROM node:14.16.1-alpine3.13

# Adding Bash Support
RUN apk add bash-completion

# Curl Installation
RUN apk --no-cache add curl

# Openssl Installation
RUN apk add openssl

# Create app directory
WORKDIR /usr/src/app

# Curl Installation
RUN apk --no-cache add curl

# Install app dependencies
COPY dist ./

# Giving Full folder permission
# RUN chmod 777 -R +x /usr/src/app/*
RUN chmod 777 -R /usr/src/app/

# Giving Full Permissions
RUN chmod +x ./dockerCommands.sh

# Install Redis Server
RUN apk add --no-cache redis

# Installing Python support
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python2 && \
    npm install --quiet node-gyp -g

# Install library dependencies
RUN npm install

# Installing PM2
RUN npm install pm2 -g

# Inside Docker article processor Service will be running under this port
EXPOSE 8095

# Statistics article processor Service Entry Point OR Starting Point
ENTRYPOINT [ "./dockerCommands.sh" ]
