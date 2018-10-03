const express = require('express');
const path = require('path');
//const fs = require('fs');
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'contactApp';

let Users = __dirname + '/users.json';
let app = express();
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'pug');

app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
let db;
MongoClient.connect(url, function(err, client){
    assert.equal(null, err);
    console.log('Connected to mongo');
    db = client.db(dbName);

    //client.close();

});

const insertDocs = function(db, callback, data){
    const collection = db.collection('users');

    collection.insertOne(
        data
    , function(err, result){
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log('inserted those 3');
        callback(result);
    })
};

const findDocs = function(db, callback) {

    const collection = db.collection('users');

    collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log('Find the following records:');
        //console.log(docs);
        callback(docs)
    });
};

app.get('/', (req, res) => {
    // res.render('index');
    let user = {
        uid: req.body.uid,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };

    //insertDocs(db, function(){}, user);
    findDocs(db, function(data){
        //onsole.log('data:' + JSON.stringify(data)) ;

        res.render('users', {users: data});

    });
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

    insertDocs(db, function(){}, user);
    findDocs(db, function(data){
        //console.log('data:' + JSON.stringify(data)) ;

        res.render('users', {users: data});

    });
});

app.get('/userEdit/:id', (req, res) => {

    console.log(req.params.id);
    findDocs(db, function(data){
        for(let i = 0; i < data.length; i++) {
            if(data[i].uid === req.params.id){
                res.render('userEdit', {user: data[i]});
            }
        }
    });
});

app.post('/userEditSubmit', (req, res) => {
    //console.log(req);
    db.collection('users').updateOne(
        { uid: req.body.uid },
        { $set: {
            name: req.body.name,
            email: req.body.email,
            age: req.body.age
            }
        }).then(function(result){
            //console.log('result:' + result);
            findDocs(db, function(data){
                //console.log('data:' + JSON.stringify(data)) ;

                res.render('users', {users: data});

            });
        });
});

app.get('/remove/:id', (req, res) => {

    db.collection('users').deleteOne({
        uid: req.params.id
    })
    .then(function(result){
        console.log('deleteCount:' + result.deletedCount);
        console.log('deleted uid: ' + req.params.id);
        findDocs(db, function(data){
            //console.log('data:' + JSON.stringify(data)) ;
            console.log('deleting...');
            res.render('users', {users: data});

        });
    });
});
    // let index = Number(req.body.delete);
    // console.log('index' + index );
    //
    // fs.readFile(Users, 'utf8', (err, data) => {
    //     if (err) throw err;
    //
    //     let allUsers = JSON.parse(data);
    //     //console.log(allUsers);
    //     for(let i = 0; i <= allUsers.users.length; i++){
    //         if(i === index){
    //             console.log('i' + i);
    //             allUsers.users.splice(index, 1);
    //         }
    //     }
    //     fs.writeFileSync(Users, JSON.stringify(allUsers));
    //     console.log(allUsers.users);
    //     res.render('users', {users: allUsers.users});
    // });



app.listen(3000, () => {
    console.log('Listening on port 3000!')
});