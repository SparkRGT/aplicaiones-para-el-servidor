.PHONY: help build up down restart logs clean test

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir todas las imágenes Docker
	docker-compose build

up: ## Levantar todos los servicios
	docker-compose up -d

down: ## Detener todos los servicios
	docker-compose down

restart: ## Reiniciar todos los servicios
	docker-compose restart

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-gateway: ## Ver logs del API Gateway
	docker-compose logs -f api-gateway

logs-menu: ## Ver logs del servicio de Menú
	docker-compose logs -f menu-service

logs-reservas: ## Ver logs del servicio de Reservas
	docker-compose logs -f reservas-service

clean: ## Detener y eliminar contenedores y volúmenes
	docker-compose down -v

clean-all: ## Limpiar todo (contenedores, volúmenes e imágenes)
	docker-compose down -v --rmi all

ps: ## Ver estado de los servicios
	docker-compose ps

health: ## Verificar health checks
	@echo "Verificando health checks..."
	@curl -s http://localhost:3000/health | jq . || echo "Gateway no disponible"
	@curl -s http://localhost:3001/health | jq . || echo "Menú Service no disponible"
	@curl -s http://localhost:3002/health | jq . || echo "Reservas Service no disponible"

dev-up: ## Levantar solo infraestructura para desarrollo
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Detener infraestructura de desarrollo
	docker-compose -f docker-compose.dev.yml down

rebuild: ## Reconstruir y levantar servicios
	docker-compose up -d --build

stop: ## Detener servicios sin eliminarlos
	docker-compose stop

start: ## Iniciar servicios detenidos
	docker-compose start

