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
const secrets = require('./helper/secrets.js');
const req = require('express/lib/request.js');

// Front Page
app.get('/', (req,res) => {
  res.sendFile('/public/index.html', { root: __dirname });
})

// IDOR ENDPOINT
function idor(_name, response) {
  // HOTFIX - prevent access to user `kelechi` [dev note [hint]: whoops, i hope that unicode collisions aren't relevant here https://docs.google.com/presentation/d/1vLj5OzmuQju3f54WNEOb1T4VA0MNjTSB/edit?usp=sharing&ouid=103056815585333361250&rtpof=true&sd=true ]
  if (_name.toUpperCase() == "kelechi") { response.send("user <b>kelechi</b> cannot be accessed"); return; }
  // HOTFIX - prevent access to user `kelechi`

  _name_lower = _name.toLowerCase()
  if (secrets.people[_name_lower]){
    response.json(secrets.people[_name_lower]) 
  }
  else {
    response.json("User Not Found")
  }
}
app.get('/idor/:name', (req, res) => {
    _name = req.params.name
    get_idor(req, res, _name) 
})
app.get('/idor', (req,res) => {
  _name = req.query.name
  get_idor(req, res, _name) 
})
function get_idor(req, res, _name){
  _admin = req.query.admin
  // make sure they supply a name
  if (_name === undefined) {
    res.json("Must include name query parameter. Try `/idor?name=test` or `/idor/test`")
  }
  // add admin=false if no admin parameter detected
  if (_admin === undefined) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    admin_param = "admin=false" 
    res.redirect(fullUrl + (fullUrl.includes("?") ? "&" : "?") + admin_param)
  }
  // only admins can view this page
  if (_admin.toLowerCase() != "true") {
    res.json("You are not an admin! HACKER DETECTED!")
  }
  idor(_name, res) 
}

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
// app.get('/rce/:file', (req, res) => {
//   file = req.params.file
//   rce(file, res) 
// })
// app.get('/rce', (req,res) => {
//   file = req.query.file
//   if (file) {
//     rce(file, res) 
//   }
//   else {
//     res.send("Must include file query parameter. Try `/rce?hello.txt`\n <!-- gotta find a better way to send file than exec(\"cat allowed/\" + file ... -->")
//   }
// })

// Auth Controls Endpoint
app.get('/auth', (req,res) => {
  let auth_cookie_id = auth_helper.getUserId(req,res);
  if (!auth_cookie_id) res.redirect(301, '/login');
  if (auth_cookie_id == "admin") res.send("Welcome admin!\n Here is the user data, please keep confidential\n" + JSON.stringify(secrets.people));
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
  if (username != '' && password != '') {
    // set cookie
    auth_helper.sendUserIdCookie(username, res);
    res.redirect(301, '/auth')
  }
  else {
    res.sendFile('/public/login.html', { root: __dirname });
  }
})

// // Share cat images
// function share(req, resp) {

// }
// app.get('/login', (req, res) => {

// })


app.get('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect(301, '/login');
})

// START SERVER
const port = 80
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
