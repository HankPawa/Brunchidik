FROM maven:3.9-amazoncorretto-21
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java -jar target/*.jar"]
