# ═══════════════════════════════════════════════════════════
# Aegis AI Platform — Makefile
# Common operational commands for development and production
# ═══════════════════════════════════════════════════════════

COMPOSE_BASE := docker compose -f docker-compose.yml
COMPOSE_DEV  := $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD := $(COMPOSE_BASE)

.PHONY: dev
dev:
	@echo "Starting Aegis development stack (hot reload enabled)..."
	$(COMPOSE_DEV) up --build

.PHONY: dev-detach
dev-detach:
	@echo "Starting Aegis development stack in background..."
	$(COMPOSE_DEV) up --build -d

.PHONY: prod
prod:
	@echo "Starting Aegis production stack in background..."
	$(COMPOSE_PROD) up --build -d

.PHONY: stop
stop:
	@echo "Stopping all Aegis containers..."
	$(COMPOSE_BASE) down

.PHONY: logs
logs:
	@echo "Streaming logs from all containers..."
	$(COMPOSE_BASE) logs -f

.PHONY: logs-server
logs-server:
	$(COMPOSE_BASE) logs -f server

.PHONY: logs-ai
logs-ai:
	$(COMPOSE_BASE) logs -f ai-engine

.PHONY: logs-client
logs-client:
	$(COMPOSE_BASE) logs -f client

.PHONY: db-shell
db-shell:
	@echo "Connecting to PostgreSQL database..."
	docker exec -it aegis_db psql -U aegis -d aegis_db

.PHONY: redis-shell
redis-shell:
	@echo "Connecting to Redis CLI..."
	docker exec -it aegis_redis redis-cli

.PHONY: rebuild
rebuild:
	@echo "Rebuilding all images cleanly without cache..."
	$(COMPOSE_BASE) build --no-cache

.PHONY: clean
clean:
	@echo "Cleaning up containers, volumes, and images..."
	$(COMPOSE_BASE) down -v --rmi local --remove-orphans

.PHONY: status
status:
	$(COMPOSE_BASE) ps

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo ""
	@echo "Aegis AI Platform — Available Commands:"
	@echo "  make dev          Start dev stack with hot reload"
	@echo "  make dev-detach   Start dev stack in background"
	@echo "  make prod         Start production stack (detached)"
	@echo "  make stop         Stop all containers"
	@echo "  make logs         Tail all service logs"
	@echo "  make logs-server  Tail backend server logs"
	@echo "  make logs-ai      Tail AI engine logs"
	@echo "  make logs-client  Tail frontend client logs"
	@echo "  make db-shell     Open psql shell inside aegis_db"
	@echo "  make redis-shell  Open redis-cli inside aegis_redis"
	@echo "  make rebuild      Rebuild Docker images without cache"
	@echo "  make clean        Tear down containers and remove volumes"
	@echo "  make status       Show current container statuses"
	@echo ""
