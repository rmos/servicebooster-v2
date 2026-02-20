DOCKER_REGISTRY_PROJECT='repo.dev.bankinter.bk/swm/et-swm-spade-mfe-ie'
APP_NAME=ireland
VERSION=$(grep -oP '(?<="version": ")[^"]*' package.json)
SOURCEPATH=$(pwd)

check_docker_operation() {
	STATUS=$1
	if [ $STATUS -ne 0 ]; then
		docker rmi $DOCKER_REGISTRY_PROJECT:$VERSION
        return 1
	fi
    return 0
}

docker stop $(docker ps -a |grep $APP_NAME|awk '{print $1;}')
docker rm $(docker ps -a |grep $APP_NAME|awk '{print $1;}')
docker build \
  --build-arg APP_NAME=$APP_NAME \
  --build-arg VERSION=$VERSION \
  --build-arg GIT_SHA=$(git rev-parse --short HEAD) \
  -t $APP_NAME:$VERSION \
  -f $SOURCEPATH/docker/$APP_NAME.Dockerfile .
docker tag $APP_NAME:$VERSION $DOCKER_REGISTRY_PROJECT:$VERSION
docker push $DOCKER_REGISTRY_PROJECT:$VERSION

echo "FIN"

