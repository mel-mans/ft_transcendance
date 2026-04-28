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

# ── Backup & Disaster Recovery ───────────────────────────────
backup:
	@echo "📦 Triggering manual database backup..."
	docker compose exec db-backup sh /scripts/backup.sh

restore:
	@echo "🔄 Restoring from latest backup..."
	docker compose exec db-backup sh /scripts/restore.sh

restore-file:
	@echo "🔄 Restoring from specified backup: $(FILE)"
	docker compose exec db-backup sh /scripts/restore.sh /backups/$(FILE)

list-backups:
	@echo "📁 Available backups:"
	docker compose exec db-backup ls -lth /backups/

.PHONY: all dirs certs up fclean backup restore restore-file list-backups
