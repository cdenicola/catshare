const { response } = require('express')
const { exec } = require("child_process");
const express = require('express')
const app = express()
app.use(express.static('public'))
// Front Page
app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

// IDOR ENDPOINT
let people = {
  "test": {"age": 0, "location": "Unknown", birthday: "1/1", "ssn": "REDACTED"},
  "miles": {"age": 20, "location": "Stanford, CA", birthday: "1/31", "ssn": "###-##-####"},
  "matthew": {"age": 21, "location": "Stanford, CA", birthday: "11/12", "ssn": "###-##-####"},
  "cooper": {"age": 21, "location": "Stanford, CA", birthday: "06/12", "ssn": "###-##-####"},
  "admin": {"age": 45, "location": "UK", birthday: "12/06", "ssn": "###-##-####"}
}
function idor(_name, response) {
  _name = _name.toLowerCase()
  if (people[_name]){
    response.json(people[_name]) 
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
    res.json("Must include name query parameter")
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
    res.send("Must include name query parameter")
  }
})

// RCE Endpoint
function rce(file, res) {
  exec("cat allowed/" + file, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        res.send(error)
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        res.send(stderr)
        return;
    }
    console.log(`stdout: ${stdout}`);
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
    res.send("Must include file query parameter")
  }
})

const port = 80
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
