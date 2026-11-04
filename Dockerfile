FROM node:24-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run lint && npm run format:check && npm test && npm run build

FROM maven:3.9.11-eclipse-temurin-21 AS backend
WORKDIR /build
COPY backend/pom.xml backend/pom.xml
RUN mvn -B -f backend/pom.xml dependency:go-offline
COPY backend/src backend/src
COPY --from=frontend /build/frontend/dist frontend/dist
RUN mvn -B -f backend/pom.xml verify

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app
RUN groupadd --gid 10001 pife && useradd --uid 10001 --gid pife --no-create-home pife \
    && mkdir -p /app/runtime/shared /app/monitor && chown -R pife:pife /app
COPY --from=backend --chown=pife:pife /build/backend/target/pife-1.0.0.jar /app/pife.jar
COPY --from=backend --chown=pife:pife /build/backend/target/classes/br/edu/pife/util/SharedMemoryMonitor.class /app/monitor/br/edu/pife/util/SharedMemoryMonitor.class
USER pife
EXPOSE 8080
CMD ["java", "-XX:MaxRAMPercentage=60.0", "-jar", "/app/pife.jar"]
