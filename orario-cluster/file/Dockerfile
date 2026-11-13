# Usa Node.js Alpine per leggerezza
FROM node:18-alpine

# Sostituisci i repository e installa bash e git in un unico step
RUN sed -i 's/https/http/' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache bash git

# Cartella di lavoro
WORKDIR /orario_lavorativo

# Copia package.json e package-lock.json e installa dipendenze
COPY package*.json ./
RUN npm install

# Copia correttamente tutto il resto del codice della web app
COPY . .

# Applica timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Rome
RUN cp /usr/share/zoneinfo/Europe/Rome /etc/localtime

# Espone porta 3000
EXPOSE 3000

# Avvia il server
CMD ["node", "server.js"]
