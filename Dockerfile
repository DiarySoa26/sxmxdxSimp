FROM apache/spark:3.5.3

USER root

RUN apt-get update && \
    apt-get install -y python3 python3-pip curl && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir \
    pandas \
    openpyxl \
    psycopg2-binary

# Driver JDBC PostgreSQL pour permettre à Spark de communiquer avec PostgreSQL
RUN curl -L \
    https://jdbc.postgresql.org/download/postgresql-42.7.4.jar \
    -o /opt/spark/jars/postgresql-42.7.4.jar

WORKDIR /app

CMD ["tail", "-f", "/dev/null"]