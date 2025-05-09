const mongoose = require("mongoose");
const { messageSchema } = require('./messageModel');
require('dotenv').config(); //[PER IL DISI] aggiungi { path: '/webapp/.env' } dentro a config()
const mongoDBUri = process.env.MONGODB_URI;

mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const now = new Date();

const userSchema = new mongoose.Schema({
    username: String,
    passw: String,
    passw_chiara: String,
    name: String,
    mail: String,
    deltaTime: { type: Number },                   //delta time in milliseconds
    friends: { type: [String], default: [] },
    inbox: {type: [messageSchema], default: []}
});

const User = mongoose.model("User", userSchema);

module.exports = User;
