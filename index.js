const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0vup.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminServiceCollection = client.db("creativeDatabase").collection("serviceData");
    const orderCollection = client.db("creativeDatabase").collection("OrderData");
    const reviewCollection = client.db("creativeDatabase").collection("reviews");
    const adminEmailCollection = client.db("creativeDatabase").collection("makeAdmin");
    const statusCollection = client.db("creativeDatabase").collection("status");


    // for image upload
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        console.log(title, description, file);
        
        const newImg = req.files.file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        adminServiceCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0)


            })

    })


    // showing serviceDat to ui
    app.get('/addService', (req, res) => {
        adminServiceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // for sending order data
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    // for showing all orders at admin service list page
    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // for single user order list 
    app.get('/singleUserOrder', (req, res) => {
        orderCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // for sending client review to server
    app.post('/review', (req, res) => {
        const order = req.body;
        reviewCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // for showing review in ui
    app.get('/review', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // making admin api
    app.post('/adminEmail', (req, res) => {
        const email = req.body;
        adminEmailCollection.insertOne(email)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // getting admin email collection
    app.get('/adminEmail', (req, res) => {
        adminEmailCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    // for status button
    app.post('/status', (req, res) => {
        const text = req.body;
        statusCollection.insertOne(text)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

});



app.get('/', (req, res) => {
    res.send("Creative agency server")
})

app.listen(process.env.PORT || port);
