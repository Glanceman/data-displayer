## build web front end 

1. `cd data-shower-web`
    1. `npm install`
    1. `npm run build`
2. copy dist folder to data-shower-server(bun)
3. `cd ../data-shower/server(bun)`
    1. add self-sign X509 cert to /certs/
    2. `docker-compose up`
