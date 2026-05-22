# syntax=docker/dockerfile:1.7

FROM maven:3.9.10-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY new-pulse-backend/.mvn .mvn
COPY new-pulse-backend/mvnw new-pulse-backend/pom.xml ./

RUN chmod +x ./mvnw \
    && ./mvnw -B -DskipTests dependency:go-offline

COPY new-pulse-backend/src ./src

RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app

WORKDIR /app

RUN mkdir -p /app/data \
    && chown -R app:app /app

COPY --from=build /workspace/target/*.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod \
    NEWS_PULSE_DB_PATH=/app/data/news-pulse.sqlite \
    TZ=Asia/Seoul

USER app

EXPOSE 8080
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://localhost:8080/api/health >/dev/null || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
