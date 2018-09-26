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
        if (err) throw err;

        let allUsers = JSON.parse(data);

        allUsers.users.push(user);

        fs.writeFile(Users, JSON.stringify(allUsers), () => {});

        res.render('users', {users: allUsers.users});
    });
});

app.get('/userEdit', (req, res) => {


    fs.readFile(Users, 'utf8', (err, data) => {
        if (err) throw err;
        let allUsers = JSON.parse(data);

        res.render('userEdit', {users: allUsers.users});
    });
});

app.post('/userEditSubmit', (req, res) => {
    //console.log(req);
    let users = [];
    let loop = req.body.uid.length;
    for(let i = 0; i <= loop; i++){
        let user = {
            uid: req.body.uid[i],
            name: req.body.name[i],
            email: req.body.email[i],
            age: req.body.age[i]
        };

        users.push(user);

    }
    let jsonData = {
        users: users
    };
    console.log(users);
    fs.writeFile(Users, JSON.stringify(jsonData), (err) => {
        if (err) throw err;
        fs.readFile(Users, 'utf8', (err, data) => {
            if (err) throw err;

            let allUsers = JSON.parse(data);

            res.render('users', {users: allUsers.users});
        });

    });
});

app.post('/remove', (req, res) => {

    let index = Number(req.body.delete);
    console.log('index' + index );

    fs.readFile(Users, 'utf8', (err, data) => {
        if (err) throw err;

        let allUsers = JSON.parse(data);
        //console.log(allUsers);
        for(let i = 0; i <= allUsers.users.length; i++){
            if(i === index){
                console.log('i' + i);
                allUsers.users.splice(index, 1);
            }
        }
        fs.writeFileSync(Users, JSON.stringify(allUsers));
        console.log(allUsers.users);
        res.render('users', {users: allUsers.users});
    });
});



app.listen(3000, () => {
    console.log('Listening on port 3000!')
});