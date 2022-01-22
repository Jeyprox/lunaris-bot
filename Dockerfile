FROM node:16.9.0
ENV NODE_ENV=production

WORKDIR /

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY ["index.js", .]

CMD [ "node", "server.js" ]