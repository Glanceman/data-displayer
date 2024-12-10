# init
1. create an self-sign cert(key.pem, cert.pem) e.g https://www.samltool.com/self_signed_certs.php and place into /certs/
1. install nodejs
1. `npm install -g bun `
1. `bun install`

# Run
- option 1 : `bun run release`
- option 2 (docker) : `docker-compose up`

# dev
- option 1 : `bun run dev`
- option 2 (docker) : `docker-compose up --watch`