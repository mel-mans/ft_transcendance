all: certs up dirs

dirs:
	sudo mkdir -p uploads/avatars uploads/listings


certs:
	@chmod +x ./infrastructure/nginx/certs/generate_certs.sh
	@./infrastructure/nginx/certs/generate_certs.sh

up:
	docker compose up --build -d

# Important: Clean everything including certs for a fresh start
fclean:
	docker compose down -v
	
	rm -f ./infrastructure/nginx/certs/*.crt ./infrastructure/nginx/certs/*.key

	sudo rm -rf uploads