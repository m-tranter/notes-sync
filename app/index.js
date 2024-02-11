'use strict';

import express from 'express';
import mongoose from 'mongoose';
//import {} from 'dotenv/config';

let pwd;
const port = 3001;
const app = express();

// Schemas & models
const userSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  pwd: {
    required: true,
    type: String,
  },
});
const noteSchema = new mongoose.Schema({
  text: {
    required: true,
    type: String,
  },
});
const Note = mongoose.model('Note', noteSchema);
const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.use(express.json());

// Mongo
const mongoString = process.env.DB_URL;
mongoose.connect(mongoString);
const db = mongoose.connection;
db.on('error', (error) => {
  console.log(error);
});

db.once('connected', async () => {
  console.log('Database connected');
  let user = await User.findOne({});
  pwd = user.pwd;
  app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
  });
});

// Routes
app.get('/load/', async (req, res) => {
  if (req.query.id === pwd) {
    let note = await Note.findOne({});
    res.json({ text: note.text });
  } else {
    res.status(401).send();
  }
});

app.post('/sync/', async (req, res) => {
  if (req.body.pwd === pwd) {
    let note = await Note.findOne({});
    note.text = req.body.text;
    let write = await note.save();
    res.status(200).send();
  }
  res.status(401).send();
});