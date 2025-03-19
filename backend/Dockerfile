# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios primero para aprovechar la caché de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código del proyecto
COPY . .

# Compila el código TypeScript a JavaScript
RUN npm run build

# Expone el puerto en el que corre NestJS
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main.js"]
