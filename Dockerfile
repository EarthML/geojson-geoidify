
FROM node:10
MAINTAINER Poul K. Sørensen "pks@earthml.com"


RUN mkdir /data && mkdir /src

VOLUME ["/data"]
 

COPY package.json /src
RUN cd /src && npm config set production && npm install
COPY src/main.js /src


WORKDIR /data
ENTRYPOINT ["node", "--max_old_space_size=256000", "/src/main.js"]

