all: certs up dirs

dirs:
	sudo mkdir -p uploads/avatars uploads/listings

certs:
	@chmod +x ./infrastructure/nginx/certs/generate_certs.sh
	@./infrastructure/nginx/certs/generate_certs.sh

up:
	docker compose up --build -d

USER        = ibougajd
IMAGES      = ai chat user listings postgres nginx front auth
TAG         = latest

# Use a shell loop with proper escaping for Makefile
push:
	@for img in $(IMAGES); do \
		echo "Tagging and Pushing $(USER)/$$img:$(TAG)..."; \
# 		docker push $(USER)/$$img:$(TAG) || (echo "Failed to push $$img" && exit 1); \
	done

K3S         = sudo k3s

# The Import Rule
import:
	@for img in $(IMAGES); do \
		echo "------------------------------------------------"; \
		echo "Processing $$img..."; \
		docker save $(USER)/$$img:$(TAG) -o /tmp/$$img.tar; \
		sudo k3s ctr images import /tmp/$$img.tar; \
		rm /tmp/$$img.tar; \
		echo "$$img imported successfully."; \
	done
	@echo "------------------------------------------------"
	@echo "All images imported. Restarting deployments..."
	$(K3S) kubectl rollout restart deployment -n transcendence
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
