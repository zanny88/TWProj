// userModel.js
const mongoose = require("mongoose");
const {messageSchema} = require('./messageModel');

const mongoDBUri = "mongodb+srv://marcostignani9:qpalzmQP8@clusternote.yd03buh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNote";
//const mongoDBUri = "mongodb+srv://giarrussolorenzo:t1otEqlgBECuv4NL@cluster0.hqzaedi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//const mongoDBUri = "mongodb://site232415:eib8PaiP@mongo_site232415/?authSource=admin&writeConcern=majority";
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    passw: String,
    name: String,
    mail: String,
    friends: { type: [String], default: [] },
    inbox: {type: [messageSchema], default: []}
});

const User = mongoose.model("User", userSchema);

module.exports = User;
