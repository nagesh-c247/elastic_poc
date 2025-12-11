# Elasticsearch POC

A simple Node.js + MongoDB + Elasticsearch + Redis proof-of-concept.

* CRUD REST API for Users, Products, Orders (stored in MongoDB)
* Each mutation immediately syncs to Elasticsearch
* `/search` endpoint with Redis caching
* Seed script inserts dummy data
* Containers for Mongo, Elasticsearch, Redis via Docker Compose

---


## Setup

```bash
# clone repo
npm install          # install dependencies

# start services
docker-compose up -d   # mongo (27017), elasticsearch (9200), redis (6379)

# seed data (10 users, 6 products, 6 orders)
npm run seed

# start API server (http://localhost:3000)
npm run dev            # nodemon hot-reload
```

Environment variables (optional overrides – create a `.env`):
```
PORT=3000
MONGO_URI=mongodb://root:example@localhost:27017/poc?authSource=admin
ES_NODE=http://localhost:9200
REDIS_URL=redis://localhost:6379
```

## REST APIs

### Users
```
GET    /users
GET    /users/:id
POST   /users           { name, email }
PUT    /users/:id       { ...fields }
DELETE /users/:id
```
### Products
```
GET    /products
GET    /products/:id
POST   /products        { name, description, price }
PUT    /products/:id
DELETE /products/:id
```
### Orders
```
GET    /orders
GET    /orders/:id
POST   /orders          { userId, productIds[], total }
PUT    /orders/:id
DELETE /orders/:id
```
### Search
```
GET /search?entity=user|product|order&q=text
```
Returns up to 20 Elasticsearch matches; cached in Redis 60 s.

## Elasticsearch inspection

```bash
# list indexes
curl http://localhost:9200/_cat/indices?v
# count docs
curl http://localhost:9200/users/_count?pretty
```

## Sample cURL
```bash
# create a user
curl -X POST http://localhost:3000/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Alice","email":"alice@example.com"}'

# search for users named Alice
curl "http://localhost:3000/search?entity=user&q=alice"
```

## Scripts
| npm script | purpose |
|------------|---------|
| `dev`      | start API with nodemon |
| `start`    | start API production mode |
| `seed`     | populate Mongo + ES with dummy data |
| `lint`     | (add linter of choice) |

---
© 2025 Elasticsearch POC
