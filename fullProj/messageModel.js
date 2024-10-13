// meesageModel.js
const mongoose = require("mongoose");

const mongoDBUri = "mongodb+srv://marcostignani9:qpalzmQP8@clusternote.yd03buh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNote";
//const mongoDBUri = "mongodb+srv://giarrussolorenzo:t1otEqlgBECuv4NL@cluster0.hqzaedi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const messageSchema = new mongoose.Schema({
    from: String,
    type: String,
    action: String,
    seen: {type: Boolean, default: false}
});

const Message = mongoose.model("Message", messageSchema);

module.exports = {Message,messageSchema};
