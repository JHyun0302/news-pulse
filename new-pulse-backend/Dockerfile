# syntax=docker/dockerfile:1.7

FROM maven:3.9.10-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY new-pulse-backend/.mvn .mvn
COPY new-pulse-backend/mvnw new-pulse-backend/pom.xml ./

RUN chmod +x ./mvnw \
    && ./mvnw -B -DskipTests dependency:go-offline

COPY new-pulse-backend/src ./src

RUN ./mvnw -B -DskipTests package \
    && sqlite_jar="$(find /root/.m2/repository/org/xerial/sqlite-jdbc -name 'sqlite-jdbc-*.jar' | sort | tail -n 1)" \
    && case "$(uname -m)" in \
        x86_64|amd64) sqlite_arch=x86_64 ;; \
        aarch64|arm64) sqlite_arch=aarch64 ;; \
        *) echo "Unsupported architecture for sqlite-jdbc native library: $(uname -m)" >&2; exit 1 ;; \
    esac \
    && mkdir -p /tmp/sqlite-jdbc-native /workspace/sqlite-native \
    && cd /tmp/sqlite-jdbc-native \
    && jar xf "$sqlite_jar" "org/sqlite/native/Linux/${sqlite_arch}/libsqlitejdbc.so" \
    && cp "org/sqlite/native/Linux/${sqlite_arch}/libsqlitejdbc.so" /workspace/sqlite-native/libsqlitejdbc.so

FROM eclipse-temurin:17-jre-jammy

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app

WORKDIR /app

RUN mkdir -p /app/data /app/lib \
    && chown -R app:app /app

COPY --from=build /workspace/target/*.jar /app/app.jar
COPY --from=build /workspace/sqlite-native/libsqlitejdbc.so /app/lib/libsqlitejdbc.so
RUN chown app:app /app/lib/libsqlitejdbc.so \
    && chmod 0755 /app/lib/libsqlitejdbc.so

ENV SPRING_PROFILES_ACTIVE=prod \
    NEWS_PULSE_DB_PATH=/app/data/news-pulse.sqlite \
    TZ=Asia/Seoul

USER app

EXPOSE 8080
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://localhost:8080/api/health >/dev/null || exit 1

ENTRYPOINT ["java", "-Dorg.sqlite.lib.path=/app/lib", "-Dorg.sqlite.lib.name=libsqlitejdbc.so", "-jar", "/app/app.jar"]
