# Use imagem oficial do Node.js
FROM node:20

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências primeiro (para cache)
COPY package*.json ./

# Instala as dependências do React
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta (React dev server)
EXPOSE 3000

# Comando para iniciar o React em modo desenvolvimento
CMD ["npm", "start"]