const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

let Users = __dirname + '/users.json';
let app = express();
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'pug');

app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/newUser', (req, res) => {
    res.render('index');
});

app.post('/userList', (req, res) => {

    let user = {
        uid: req.body.uid,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };

    fs.readFile(Users, 'utf8', (err, data) => {
        if(err) throw err;

        let allUsers = JSON.parse(data);

        allUsers.users.push(user);

        fs.writeFile(Users, JSON.stringify(allUsers), () => {});

        res.render('users', {users: allUsers.users});
    });


});



app.listen(3000, () => {
    console.log('Listening on port 3000!')
});