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

// Front Page
app.get('/', (_, res) => {
    res.sendFile('/public/index.html', { root: __dirname });
})

// IDOR ENDPOINT /user
function idor(_id, response) {
    // HOTFIX - prevent access to user `kelechi` [dev note [hint]: whoops, i hope that unicode collisions aren't relevant here https://docs.google.com/presentation/d/1vLj5OzmuQju3f54WNEOb1T4VA0MNjTSB/edit?usp=sharing&ouid=103056815585333361250&rtpof=true&sd=true ]
    // if (_name.toUpperCase() == "kelechi") { response.send("user <b>kelechi</b> cannot be accessed"); return; }
    // HOTFIX - prevent access to user `kelechi`
    
    // _name_lower = _name.toLowerCase()
    // if (secrets.people[_name_lower]){
    // response.json(secrets.people[_name_lower]) 
    // }
    // else {
    // response.json("User Not Found")
    // }
    if (secrets.people.length <= _id) {
        response.json("User Not Found")
    } else {
        response.json(secrets.people[_id]) 
    }
}

app.get('/user/:id', (req, res) => {
    _id = req.params.id
    get_user(req, res, _id) 
})

app.get('/user', (req,res) => {
    _id = req.query.id
    get_user(req, res, _id) 
})

function get_user(req, res, _id) {
    _admin = req.query.admin
    // make sure they supply a name
    if (_id === undefined || Number.isNaN(parseInt(_id))) {
        res.send("Must include id query parameter, which must be a number. Try `/user?id=0` or `/user/0`")
        return
    }
    // add admin=false if no admin parameter detectedm
    else if (_admin === undefined) {
        admin_param = "admin=false"
        res.redirect(req.originalUrl + (req.originalUrl.includes("?") ? "&" : "?") + admin_param)
    }
    // only admins can view this page
    else if (_admin.toLowerCase() != "true") {
        res.send("You are not an admin! HACKER DETECTED!")
    }
    
    // otherwise, idor
    else {
        idor(_id, res) 
    }
}

// XSS Endpoint
function hello(_name, response) {
    response.send("Hello " + _name + "! Here is your custom cat! <br/> <img src='https://cataas.com/cat/says/Hello%20" + _name.replace('/','') + "'>")
}

app.get('/hello', (req,res) => {
    _name = req.query.name
    if (_name) {
        hello(_name, res) 
    }
    else {
        res.send("Include your name so we can say hello with a custom cat photo! Try `/hello?name=test`")
    }
})

// Auth Controls Endpoint
app.get('/auth', (req,res) => {
    let auth_cookie_id = auth_helper.getUserId(req,res);
    if (!auth_cookie_id) {
        res.redirect(303, '/login');
    }
    if (auth_cookie_id == "admin") res.send("Welcome admin!\n Here is the user data, please keep confidential\n" + JSON.stringify(secrets.people));
    res.send("You are " + auth_cookie_id + ".\nSorry, you do not have admin access to this endpoint. <a href='/logout'>logout</a>");
})

app.get('/login', (req,res) => {
    // if logged in, redirect
    try {
        if (auth_helper.getUserId(req,res)) res.redirect(303, '/auth')
    } catch {}
    res.sendFile('/public/login.html', { root: __dirname });
})

app.post('/login', (req,res) => {
    let username = req.body['username'];
    let password = req.body['password'];
    if (username != '' && password != '') {
        // set cookie
        auth_helper.sendUserIdCookie(username, res);
        res.redirect(303, '/auth')
    }
    else {
        res.sendFile('/public/login.html', { root: __dirname });
    }
})

app.get('/logout', (_, res) => {
    res.clearCookie('userId');
    res.redirect(303, '/login');
})

app.get('/secret', (_, res) => {
    res.sendFile('/public/secret.html', { root: __dirname })
})

// START SERVER
const port = 3000
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
