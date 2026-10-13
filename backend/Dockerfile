# FROM maven:3.9-eclipse-temurin-21 AS build

# WORKDIR /app

# COPY pom.xml .

# RUN mvn dependency:go-offline

# COPY src ./src

# RUN mvn clean package -DskipTests


# FROM eclipse-temurin:21-jre

# WORKDIR /app

# COPY --from=build /app/target/*.jar app.jar

# EXPOSE 8080

# ENTRYPOINT ["java", "-jar", "app.jar"]






# FROM maven:3.9-eclipse-temurin-21 AS build

# WORKDIR /app

# COPY pom.xml .
# COPY src ./src

# RUN --mount=type=cache,target=/root/.m2 \
#     mvn package -DskipTests -B

# FROM eclipse-temurin:21-jre

# WORKDIR /app

# COPY --from=build /app/target/*.jar app.jar

# EXPOSE 8080

# ENTRYPOINT ["java", "-jar", "app.jar"]




# FROM eclipse-temurin:21-jre

# WORKDIR /app

# COPY target/*.jar app.jar

# EXPOSE 8080

# ENTRYPOINT ["java", "-jar", "app.jar"]





# Étape 1 : Compilation Spring Boot
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier les dépendances Maven
COPY pom.xml .

# Télécharger les dépendances avec cache
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Compiler Spring Boot avec cache Maven
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn clean package -DskipTests -B


# Étape 2 : Exécution
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
