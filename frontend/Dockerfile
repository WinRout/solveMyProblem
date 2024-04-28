FROM node:22-alpine3.18

ENV GOOGLE_CLIENT_ID=58711578503-vtp2b1r8s6hecpsp1ue6m24c7otnvs4f.apps.googleusercontent.com
ENV GOOGLE_CLIENT_SECRET=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

WORKDIR /apps

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm run build

# for development purposes
CMD ["npx", "next", "dev"]