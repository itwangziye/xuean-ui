PROJECT:=xuean-ui


# make build-linux
build-linux:
	@docker build -t xuean-ui:latest .
	@echo "build successful"

# make run
run:
    # delete xuean-ui-api container
	@if [ $(shell docker ps -aq --filter name=xuean-ui --filter publish=80) ]; then docker rm -f xuean-ui; fi

    # 进入到项目根目录 执行 make run 命令
	@docker-compose up -d

	@echo "xuean-ui service is running..."

	# delete Tag=<none> 的镜像
	@docker image prune -f
	@docker ps -a | grep "xuean-ui"

stop:
    # delete xuean-ui-api container
	@if [ $(shell docker ps -aq --filter name=xuean-ui --filter publish=80) ]; then docker-compose down; fi
	#@if [ $(shell docker ps -aq --filter name=xuean-ui --filter publish=80) ]; then docker rm -f xuean-ui; fi
	#@echo "xuean-ui stop success"


# make deploy
deploy:

	#@git checkout master
	#@git pull origin master
	make build-linux
	make run