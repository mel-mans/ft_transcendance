all: certs up

certs:
	@chmod +x ./infrastructure/nginx/certs/generate_certs.sh
	@./infrastructure/nginx/certs/generate_certs.sh

up:
	docker compose up --build -d

# Important: Clean everything including certs for a fresh start
fclean:
	docker compose down -v
	
	rm -f ./infrastructure/nginx/certs/*.crt ./infrastructure/nginx/certs/*.key