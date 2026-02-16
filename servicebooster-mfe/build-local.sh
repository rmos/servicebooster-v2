docker build -f docker/shell.Dockerfile -t sb-shell:prod .
docker build -f docker/ireland.Dockerfile -t mf-ireland:prod .
docker build -f docker/portugal.Dockerfile -t mf-portugal:prod .
#docker compose -f docker/docker-compose.yml build --no-cache
docker compose -p service-booster-v2 -f docker/docker-compose.yml up -d
#docker compose -f docker/docker-compose.yml down -v
#docker run -d --name sb-shell -dit --restart always -p 8080:80 sb-shell:prod
#http://localhost:8080/v2/?mf=all&mfEnv=prod