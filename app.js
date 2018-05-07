const feathers = require('@feathersjs/feathers');
const express = require("@feathersjs/express");
const socketio = require('@feathersjs/socketio');
const memory = require('feathers-memory');
const PORT = 3030;

const app = express(feathers());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());
app.configure(socketio());

app.on('connection', connection => app.channel('everybody').join(connection));
app.publish(() => app.channel('everybody'));

app.use('messages', memory({
  paginate: {
    default: 10,
    max: 25
  }
}));

app.use(express.errorHandler());
const server = app.listen(PORT);

server.on('listening', () => console.log('Feathers API started at localhost:3030'));