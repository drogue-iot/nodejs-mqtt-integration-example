# Install the app dependencies in a full UBI Node docker image
FROM registry.access.redhat.com/ubi8/nodejs-16:latest AS build-image

USER root

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --production

FROM registry.access.redhat.com/ubi8/nodejs-16-minimal:latest


# Install app dependencies
COPY --from=build-image /opt/app-root/src/node_modules /opt/app-root/src/node_modules
COPY . /opt/app-root/src

ENV NODE_ENV=production PORT=8080

EXPOSE 8080
CMD ["npm", "start"]
