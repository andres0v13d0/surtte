# Usar la misma versión de Node.js que en tu máquina local
FROM node:21

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia solo los archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Compila TypeScript a JavaScript
RUN npm run build

# Expone el puerto 3000
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main.js"]

