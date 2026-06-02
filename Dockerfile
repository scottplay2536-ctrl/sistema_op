# Usar una imagen oficial de Node estable y ligera
FROM node:20-alpine

# Crear el directorio de trabajo de la app
WORKDIR /usr/src/app

# Copiar archivos de dependencias e instalar
COPY app/package*.json ./
RUN npm install --omit=dev

# Copiar el codigo fuente de la aplicacion
COPY app/ .

# Exponer el puerto de la aplicacion
EXPOSE 3000

# Comando para arrancar la aplicacion
CMD [ "node", "src/server.js" ]
