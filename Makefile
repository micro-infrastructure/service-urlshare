.PHONY: build

build:
	docker build -t recap/process-urlshare:v0.1 .

push: build
	docker push recap/process-urlshare

run: build
	docker run -it --privileged recap/process-urlshare:v0.1 sh

