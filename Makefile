cu:
	docker-compose -f docker-compose.dev.yml up -d --build
cd:
	docker-compose -f docker-compose.dev.yml down