# CatShare: A Cat-Themed Vulnerable Website

This is a purposely insecure toy webserver for learning about security vulnerabilities. 

This was originally designed for Stanford's [CS106S](https://cs106s.stanford.edu/) and was authored by [Cooper de Nicola](https://github.com/cdenicola), [Aditya Saligrama](https://saligrama.io), and George Hosono. It has since been used a few times for workshops by [Stanford Applied Cyber](https://applied-cyber.stanford.edu). Feel free to use for your own lessons or learning. 

## Features

* IDOR (in `/user` endpoint)
* XSS (in `/hello` endpoint)
* Insecure session handling (in `/login` endpoint)

## Installation

### Running the webserver on your machine (testing only)

First cd into the `app` directory.

Make sure dependencies are installed using the command `npm install`.

Start the server using command `node index.js`. Access the server on `localhost:3000`. 

### Running the webserver using docker-compose

Initialize the TLS certificates from Let's Encrypt using [this script](https://github.com/wmnnd/nginx-certbot/blob/master/init-letsencrypt.sh) edited to add your email and domain. Note you may need to edit the line that says

```bash
docker-compose up --force-recreate -d nginx
```

to

```
docker-compose up --force-recreate -d nginx app
```

Then simply run `docker-compose up`. Note you'll need to replace usage of `catshare.saligrama.io` with your domain.

There is a [systemd service](./docker-compose.service) that can start the app at system start.