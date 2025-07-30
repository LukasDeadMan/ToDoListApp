# Use uma imagem oficial do Python
FROM python:3.11

# Cria o diretório de trabalho dentro do container
WORKDIR /app

# Copia as dependências primeiro (para cache)
COPY requirements.txt .

# Instala as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .

# Expõe a porta (mesma do Flask)
EXPOSE 5000

# Comando para iniciar o Flask (ajuste se seu entrypoint for diferente)
CMD ["flask", "run", "--host=0.0.0.0"]