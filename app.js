const express = require('express');
const mongoose = require('./database/mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var passport = require('passport');
fs = require('fs');

const List = require('./database/models/list');
const Task = require('./database/models/task');
const User = require('./database/models/user');
const Client = require('./database/models/client');
const Product = require('./database/models/product');
const PreorderRequest = require('./database/models/preorder_request');
const PurchaseOrder = require('./database/models/purchase_order');

const app = express();

require('./config/passport');

var users = require('./routes/users');
var clients = require('./routes/clients');
var products = require('./routes/products');
var preorder_requests = require('./routes/preorder_requests');
var purchase_orders = require('./routes/purchase_orders');

app.use(express.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

app.use(passport.initialize());

app.use('/users', users);
app.use('/clients', clients);
app.use('/products', products);
app.use('/preorder_requests', preorder_requests);

app.get('/lists', (req, res) => {
	List.find({})
		.then(lists => res.send(lists))
		.catch((error) => console.log(error));
});

app.post('/lists', (req, res) => {
	(new List({ 'title': req.body.title }))
		.save()
		.then(list => res.send(list))
		.catch((error) => console.log(error));
});

app.get('/lists/:listId', (req, res) => {
	List.find({ _id: req.params.listId })
		.then(list => res.send(list))
		.catch((error) => console.log(error));
});

app.patch('/lists/:listId', (req, res) => {
	List.findOneAndUpdate( {'_id': req.params.listId} , {$set: req.body })
		.then(list => res.send(list))
		.catch((error) => console.log(error));
});

app.delete('/lists/:listId', (req, res) => {
	const deleteTasks = (list) => {
		Task.deleteMany({ _listId: list._id})
			.then(() => list)
			.catch((error) => console.log(error));
	};
	List.findByIdAndDelete( { '_id': req.params.listId} )
		.then(list => res.send(deleteTasks(list)))
		.catch((error) => console.log(error));

});

app.get('/lists/:listId/tasks', (req, res) => {
	Task.find({ _listId: req.params.listId})
		.then(tasks => res.send(tasks))
		.catch((error) => console.log(error));
});

app.post('/lists/:listId/tasks', (req, res) => {
	(new Task({ 'title': req.body.title, '_listId': req.params.listId }))
		.save()
		.then(task => res.send(task))
		.catch((error) => console.log(error));
});

app.get('/lists/:listId/tasks/:taskId', (req, res) => {
	Task.findOne({ _id: req.params.taskId , _listId: req.params.listId})
		.then(task => res.send(task))
		.catch((error) => console.log(error));
});

app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
	Task.findOneAndUpdate( {'_id': req.params.taskId, _listId: req.params.listId } , {$set: req.body }, { new: true })
		.then(task => res.send(task))
		.catch((error) => console.log(error));
});

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
	Task.findByIdAndDelete( { '_id': req.params.taskId, '_listId': req.params.listId} )
		.then(task => res.send(task))
		.catch((error) => console.log(error));
});

app.get('/image/:imgUrl', (req, res, next) => {
	fs.readFile(`my_uploaded_files/${req.params.imgUrl}`, function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such image");    
        } else {
            //specify the content type in the response will be an image
			if (req.params.imgUrl.match(/\.(jpg|jpeg)$/)) {
				res.writeHead(200,{'Content-type':'image/jpg'});
            	res.end(content);
			} else {
				res.writeHead(200,{'Content-type':'image/png'});
            	res.end(content);
			}
            
        }
    });
});

app.listen(3000, () => console.log("server Connected on port 3000"));