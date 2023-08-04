FROM node:20-alpine
ENV NODE_ENV=development

RUN npm install --global gulp-cli

WORKDIR /home/node/app

COPY lib lib
COPY resources resources
COPY gulpfile.ts .
COPY *.json .

RUN npm install

RUN mkdir /assets
RUN mkdir /output
