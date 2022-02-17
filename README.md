# CS 106s Vulnerable Website
## by Cooper de Nicola 
#### https://github.com/cdenicola/CS106S-VulnerabilityExample

This is a purposely insecure toy webserver for learning about security vulnerabilities. 

This was originally designed for Stanford's [CS106S](https://cs106s.stanford.edu/). Feel free to use for your own lessons or learning. 

## Features


## Installation
### Running the webserver on your machine (testing only)
Make sure dependencies are installed using the command `npm install`.

Start the server using command `node index.js`. Access the server on `localhost:80`. 

Note: this is dangerous. The server exposes an RCE vulnerability by default. If you run it on your local machine, anyone can have. 

### Running the webserver in docker
First build a docker image of the server. Use the command
`docker build . -t <your username>/cs106s-vulnerable-website`

Then run the server's image in a container
`docker run -p <port>:80 -d <your username>/cs106s-vulnerable-website`

This will start the website on `localhost:<port>`. If your host is acessible via the internet, you can access this website on `<your ip address>:<port>`. 

Happy Hacking!