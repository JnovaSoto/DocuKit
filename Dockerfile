FROM node:lts-alpine 
WORKDIR /app 
COPY . . 
RUN npm install --omit=dev 
RUN npm create-db
RUN npm start
EXPOSE 3000 
CMD ["node", "src/index.js"] 
