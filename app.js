const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'contactApp';

let Users = __dirname + '/users.json';
let app = express();
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'pug');

app.use('/remove', express.static('public'));
app.use('/', express.static('public'));
app.use(express.static(__dirname + '/public'));
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

    collection.find().toArray(function(err, docs) {
        assert.equal(err, null);
        callback(docs)
    });
};

app.get('/', (req, res) => {
    findDocs(db, function(data){
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
        res.render('users', {users: data});
    });
});

app.get('/userEdit/:id', (req, res) => {

    findDocs(db, function(data){
        console.log('params: ' + req.params.id);
        for(let i = 0; i < data.length; i++) {
            if(Number(data[i].uid) === Number(req.params.id)){
                console.log('look at me');
                console.log(data[i].name);
                res.render('userEdit', {user: data[i]});
            }
            else{
               console.log('wrong...')
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
        findDocs(db, function(data){

            res.render('users', {users: data});

        });
    });
});

app.get('/remove/:id', (req, res) => {

    db.collection('users').deleteOne({
        uid: req.params.id
    }).then(function(result){
        console.log('deleteCount:' + result.deletedCount);
        console.log('deleted uid: ' + req.params.id);
        findDocs(db, function(data){
            //console.log('data:' + JSON.stringify(data)) ;
            console.log('deleting...');
            res.render('users', {users: data});

        });
    });
});

app.get('/sort', (req, res) => {

    if(req.query.sorter === 'asc'){
        console.log('ascending!');
        db.collection('users').find().sort({name: 1}).toArray(function (err, data) {
            res.render('users', {users: data});
        });
    }

    else if(req.query.sorter === 'desc'){
        console.log('descending!');
        db.collection('users').find().sort({name: -1}).toArray(function (err, data) {
            res.render('users', {users: data});
        });
    }
});

app.get('/genUsers', (req, res) => {
    fs.readFile(Users, 'utf8', (err, data) => {
        if (err) throw err;
        let Data = JSON.parse(data);
        db.collection('users').insertMany(Data.users, function(err, res){
            if (err) throw err;
        });
    });
});

app.post('/filter', (req, res) => {
    console.log(req.body.searchbar);

    db.collection('users').find( { $text: { $search: req.body.searchbar, $caseSensitive: false } }).toArray(function (err, data) {
        if (err) throw err;
        res.render('users', {users: data})
    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000!')
});