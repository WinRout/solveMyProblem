FROM node:22-alpine3.18

WORKDIR /apps

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm run build
RUN npm run build
# for development purposes
CMD ["npm", "start"]