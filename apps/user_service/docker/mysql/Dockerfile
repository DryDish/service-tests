FROM mysql:latest

# Whatever is copied into this foler on the container will be auto run on creation
COPY ./1_create_table.sql /docker-entrypoint-initdb.d/1_create_table.sql
