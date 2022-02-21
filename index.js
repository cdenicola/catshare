const { response } = require('express')
const { exec } = require("child_process");
var morgan = require('morgan')
const express = require('express')


const app = express()
app.use(express.static('public'))
// Logging

app.use(morgan('combined'))

// handle posts
app.use(require('body-parser').urlencoded({ extended: false }));

// my helpers
const auth_helper = require('./helper/auth.js'); 
const secrets = require('./helper/secrets.js')

// Front Page
app.get('/', (req,res) => {
  res.sendFile('/public/index.html', { root: __dirname });
})

// IDOR ENDPOINT
function idor(_name, response) {
  // HOTFIX - prevent access to user `kooper` [dev note: whoops, ga]
  if (_name.toUpperCase() == "KOOPER") response.send("user <b>kooper</b> cannot be accessed")
  // HOTFIX - prevent access to user `kooper`

  _name = _name.toLowerCase()
  if (secrets.people[_name]){
    response.json(secrets.people[_name]) 
  }
  else {
    response.json("User Not Found")
  }
}
app.get('/idor/:name', (req, res) => {
    _name = req.params.name
    idor(_name, res) 
})
app.get('/idor', (req,res) => {
  _name = req.query.name
  if (_name) {
    idor(_name, res) 
  }
  else {
    res.json("Must include name query parameter. Try `/idor?name=test` or `/idor/test`")
  }
})

// XSS Endpoint
function xss(_name, response) {
  response.send("Welcome to the website " + _name)
}
app.get('/xss', (req,res) => {
  _name = req.query.name
  if (_name) {
    xss(_name, res) 
  }
  else {
    res.send("Must include name query parameter. Try `/xss?name=test`")
  }
})

// RCE Endpoint
function rce(file, res) {
  exec("cat allowed/" + file, (error, stdout, stderr) => {
    if (error) {
        // console.log(`error: ${error.message}`);
        res.send(error)
        return;
    }
    if (stderr) {
        // console.log(`stderr: ${stderr}`);
        res.send(stderr)
        return;
    }
    // console.log(`stdout: ${stdout}`);
    res.send(stdout)
  });
}
app.get('/rce/:file', (req, res) => {
  file = req.params.file
  rce(file, res) 
})
app.get('/rce', (req,res) => {
  file = req.query.file
  if (file) {
    rce(file, res) 
  }
  else {
    res.send("Must include file query parameter. Try `/rce?hello.txt`\n <!-- gotta find a better way to send file than exec(\"cat allowed/\" + file ... -->")
  }
})

// Auth Controls Endpoint
app.get('/auth', (req,res) => {
  let auth_cookie_id = auth_helper.getUserId(req,res);
  if (!auth_cookie_id) res.redirect(301, '/login');
  if (auth_cookie_id == "admin") res.send("Welcome admin!\n Here is the user data, please keep confidential\n" + secrets.people);
  res.send("You are " + auth_cookie_id + ".\nSorry, you do not have admin access to this endpoint.");
})

app.get('/login', (req,res) => {
  // if logged in, redirect
  try {
    if (auth_helper.getUserId(req,res)) res.redirect(301, '/auth')
  } catch {}
  res.sendFile('/public/login.html', { root: __dirname });
})

app.post('/login', (req,res) => {
  let username = req.body['username'];
  let password = req.body['password'];
  if (username == 'cooper' && password == 'cooper') {
    // set cookie
    auth_helper.sendUserIdCookie(username, res);
    res.redirect(301, '/auth')
  }
  else {
    res.sendFile('/public/login.html', { root: __dirname });
  }
})

app.get('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect(301, '/login');
})

// START SERVER
const port = 80
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
