# Discord Job Tracker Bot

## Prerequisites

### Install Docker Engine

```bash
	curl -fsSL https://get.docker.com -o get-docker.sh
	sudo sh get-docker.sh
```

### Install Docker-Compose

```bash
	sudo curl -L "https://github.com/docker/compose/releases/download/v2.6.0/docker-compose-$(uname -s)-$(uname -m)"  -o /usr/local/bin/docker-compose
	sudo mv /usr/local/bin/docker-compose /usr/bin/docker-compose
	sudo chmod +x /usr/bin/docker-compose
```

## Starting (Dev/Prod)

Clone the project

```bash
	git clone https://github.com/BlazeIsClone/job-tracker-bot
```

Go to the project directory

```bash
	cd job-tracker-bot
```

Install dependencies

```bash
	npm install
```

Start the container

```bash
	npm run container:up
```

Run Database Migrations (Warn: resets database rows)

```bash
	npm run migrate
```

Stop the container

```bash
	npm run container:down
```

Stop the container and clear cache

```bash
	npm run container:reset
```
