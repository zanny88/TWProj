const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const _ = require("lodash");
const cors = require('cors');
const { clear } = require("console");
app.use(cors());
// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware for parsing application/x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const mongoDBUri = "mongodb+srv://marcostignani9:qpalzmQP8@clusternote.yd03buh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNote";
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const noteSchema = new mongoose.Schema ({
    user: String,
    public: Boolean,
    heading: String,
    content: String,
    author: String,
    date: {type: Date, default: Date.now()},
    place: String,
    tags: [String],
    el_type: {type: String, default: "notes"}
});

const todoSchema = new mongoose.Schema({
    user: String,
    public: Boolean,
    heading: String,
    tasks: [String],
    author: String,
    date: {type: Date, default: Date.now()},
    completed: [Boolean],
    place: String,
    tags: [String],
    el_type: {type: String, default: "Todo"}
});

const sessionSchema = new mongoose.Schema({
    user: String,
    startSession: {type: Date, default: Date(new Date().getTime())},
    replayable: {type: Boolean, default: false},
    studyTime: Number,
    pauseTime: Number,
    cicles: Number,
    inactiveTime: {type: Number, default: 0},
    state: {type: String, default: "Study"}
});

const userSchema = new mongoose.Schema({/*!!!!!!!!!!!!!!!!!*/
    name: String,
    passw: String,
    friends: {type: [String], default: []},
    inbox: {type: [String], default: []}
});

const Note = mongoose.model("Note",noteSchema);
const Todo = mongoose.model("Todo",todoSchema);
const User = mongoose.model("User",userSchema);/*!!!!!!!!!!!*/
const Session = mongoose.model("Session",sessionSchema);
var currentUser = null;
var progress = null;
var pTime = null;
var friendSearch = false;
var empty_inbox = "https://cdn2.iconfinder.com/data/icons/sharp-email-vol-2/32/2_inbox_email-01-128.png";
var new_message = "https://cdn2.iconfinder.com/data/icons/sharp-email-vol-2/32/2_inbox_email-20-128.png";

function loggedIn(){
    return currentUser != null;
}

function checkInbox(){
    if(currentUser.inbox.length > 0){
        return new_message;
    }else{
        return empty_inbox;
    }
}

app.get("/timer/save", (req,res) => {
    var arrayInfo = req.query.timerInfo;

    var newSession = new Session({
        user: currentUser.name,
        studyTime: arrayInfo[0],
        pauseTime: arrayInfo[1],
        cicles: arrayInfo[2]
    });

    try{
        newSession.save();
        res.json(newSession._id);
    }catch(error){
        res.status(500).send("Error saving timer");
    }
    res.send(undefined);
});

app.get("/timer/update",async (req,res) => {
    var id = req.query.sID;
    
    var session = Session.findById(id);
    if(!id){//reset e restart after stop
        if(progress){
            clearInterval(progress);
            progress = null;
            session.inactiveTime += ((new Date(new Date().getTime())) - pTime);
            pTime = null;
            await session.save();
        }
    }else{
        if(!pTime){
            pTime = new Date(new Date().getTime());
        }
        progress = setInterval(async () => {//del after 30 min stop
            let checkTime = new Date(new Date().getTime());
            if(checkTime - pTime >= (30*60*1000)){
                session.inactiveTime += (30*60*1000);
                await session.save();
                clearInterval(progress);
                progress = null;
                res.json(true);
            }
        },1000);
    }
});

app.get("/pomodoro",async (req,res) => {
    if(loggedIn()){
        if(progress){
            clearInterval(progress);
            progress = null;
        }
        var sessions = await Session.find({});
        var session = sessions.pop(sessions.length-1);
        if(((session.studyTime + session.pauseTime)*session.cicles)*60*1000 - session.inactiveTime < (30*60*1000)){
            session = "";
        }

        res.cookie('data',JSON.stringify(session));
        res.render("pomodoro");
    }else{
        res.redirect("/user/login");
    }
});

app.get("/inbox/check",(req,res) => {
    if(loggedIn()){
        const inbox_img = checkInbox();
        //res.cookie('inbox',JSON.stringify(inbox_img));
        res.json(inbox_img);
    }else{
        res.json("");
    }
});

app.get("/",async (req,res) => {
    if(!loggedIn()){
        res.redirect("/user/login");
    }else{
        if(progress){
            clearInterval(progress);
            progress = null;
        }
        const note = await Note.find({user: currentUser.name}).limit(3);
        const todo = await Todo.find({user: currentUser.name}).limit(3);
        res.render("home",{notes: note, todos: todo});
    }
});

app.get("/showNotes",async (req,res) => {
    if(loggedIn()){
        if(progress){
            clearInterval(progress);
            progress = null;
        }
        const notes = await Note.find({user: currentUser.name});
        res.render("note_page",{notes});
    }else{
        res.redirect("/user/login");
    }
});

app.get("/:author/showTodos",async (req,res) => {
    if(loggedIn()){
        if(progress){
            clearInterval(progress);
            progress = null;
        }
        const tmp = await Todo.find({user: req.params.author});
        var todos = [];
        tmp.forEach(t => {
            if(friendSearch){
                if(t.public){
                    todos.push(t);
                }
            }else{
                todos.push(t);
            }
        })

        res.render("todo_page",{todos});
    }else{
        res.redirect("/user/login");
    }
});

app.get("/compose",(req,res) => {
    if(loggedIn()){
        if(progress){
            clearInterval(progress);
            progress = null;
        }
        res.render("compose",{todo: null});
    }else{
        res.redirect("/user/login");
    }
});
/*--------------------------------------------*/

app.post("/user/friend/:friendName/:action",async (req,res) => {
    const friendN = req.params.friendName;
    currentUser.inbox = currentUser.inbox.filter(item => item !== friendN);

    if(req.params.action == "accept"){
        try{
            var friend = await User.findOne({name: friendN});

            friend.friends.push(currentUser.name);
            currentUser.friends.push(friendN);

            friend.save();
            currentUser.save();

            res.redirect("/user/inbox");
        }catch(error){
            res.status(500).send("error fetching friend");
        }
    }else{
        currentUser.save();
        res.redirect("/user/inbox");
    }
});

app.get("/user/addFriend", (req,res) => {
    if(loggedIn()){
        res.render("friendPage");
    }
});

app.get('/user/inbox',(req,res) => {
    const msgs = currentUser.inbox;

    res.render("inboxPage",{m: msgs});
});

app.post("/user/addFriend", async (req,res) => {
    var friendName = req.body.friendUsername;
    if(!currentUser.friends.includes(friendName)){
        try{
            var friend = await User.findOne({name: friendName});
            if(!friend){
                res.render("friendPage");
            }else{
                friend.inbox.push(currentUser.name);
                friend.save();

                res.redirect("/");
            }
        }catch(error){
            res.status(500).send("Error saving friend");
        }
    }
});

app.get("/user/login",(req,res) => {
    if(progress){
        clearInterval(progress);
        progress = null;
    }
    res.cookie('flag',JSON.stringify(false));
    res.render("registerLogin");
});

app.get("/user/register",(req,res) => {
    if(progress){
        clearInterval(progress);
        progress = null;
    }
    res.cookie('flag',JSON.stringify(true));
    res.render("registerLogin");
});

app.post("/user/logout",(req,res) => {
    if(progress){
        clearInterval(progress);
        progress = null;
    }
    currentUser = null;
    res.redirect("/");
});

app.post("/user/:regType",async (req,res) => {
    var newUser = null;
    var user = null;
    var x = null;
    if(req.params.regType == "login"){
        try{
            user = await User.findOne({name: req.body.username});
            if(!user){
                res.redirect("/user/login");
            }else{
                currentUser = user;
                res.redirect("/");
            }
        }catch(error){
            res.status(500).send("Error login");
        }
    }else{
        x = await User.findOne({name: req.body.username});
        if(x){
            res.render("registerLogin");
        }else{
            var newUser = new User({
                name: req.body.username,
                passw: req.body.password
            });
            try{
                newUser.save();
                currentUser = newUser;
                res.redirect("/");
            }catch(error){
                res.status(500).send("Error saving new user");
            }
        }
    }
});
/*------------------------------------------------------*/
app.post("/compose", async (req,res) => {
    if(req.body.typeNote == "note"){
        var newNote = new Note({
            user: currentUser.name,
            public: req.body.publicCheck != undefined ? true : false,
            heading: req.body.title,
            content: req.body.post,
            author: currentUser.name,
            place: req.body.place,
            tags: req.body.tags.split(',').map(tag => tag.trim())
        });
    }else{
        var flag = false;
        var todo;
        var newTodo;
        if(req.body.todoid){
            todo = await Todo.findById(req.body.todoid);

            todo.heading = req.body.title;
            var newTasks = req.body.post.split("\n").map(task => task.trim());
            var oldComp = [];
            var newComp = [];
            for(let i=0;i<todo.completed.length;i++){
                if(todo.completed[i]){
                    oldComp.push(i);
                }
            }
            oldComp.forEach(index => {
                if(newTasks.includes(todo.tasks[index])){
                    newComp.push(newTasks.indexOf(todo.tasks[index]));
                }
            });
            todo.tasks = newTasks;
            todo.completed = [];
            for(let i=0;i<todo.tasks.length;i++){
                todo.completed.push(newComp.includes(i));
            }
            todo.place = req.body.place;
            todo.tags = req.body.tags.split(",").map(tag => tag.trim());

            flag = true;
        }else{
            newTodo = new Todo({
                user: currentUser.name,
                public: req.body.publicCheck != undefined ? true : false,
                heading: req.body.title,
                tasks: req.body.post.split("\n").map(task => task.trim()),
                author: currentUser.name,
                completed: Array(req.body.post.split("\n").length).fill(false),
                place: req.body.place,
                tags: req.body.tags.split(",").map(tag => tag.trim())
            });
            newTodo.tasks = newTodo.tasks.filter(item => item !== "");
        }
    }
    try{
        if(req.body.typeNote == "note"){
            await newNote.save();
        }else{
            if(flag){
                await todo.save()
            }else{
                await newTodo.save();
            }
        }
        res.redirect("/");
    }catch(error){
        console.log(error);
        res.status(500).send("Error posting Blog");
    }
});

app.post("/addTask",async (req,res) => {
    const todoId = req.body.todoid;
    try{
        var t = await Todo.findById(todoId);

        res.cookie('data',JSON.stringify(t));
        res.render("compose");
    }catch(error){
        res.status(500).send("Error fetching todo");
    }
});

app.get("/notes/:author/:noteName",async (req,res) => {
    if(progress){
        clearInterval(progress);
        progress = null;
    }
    try{
        const noteName = decodeURIComponent(req.params.noteName);
        const note = await Note.findOne({ user: req.params.author, heading: new RegExp('^' + _.escapeRegExp(noteName) + '$', 'i')});
        if(note){
            res.render("note",{
                id: note._id,
                title: note.heading,
                post: note.content,
                author: note.author,
                date: note.date,
                place: note.place,
                tags: note.tags
            })
        }else{
            req.status(404).send("Note not found");
        }
    }catch(error){
        console.log(error);
        res.status(500).send("Error retrieving note");
    }
});

async function realFunc(u,filter,query){
    let results = [];
    if(filter == "tag"){
        const allNote = await Note.find({user: u});
        const allTodo = await Todo.find({user: u});
        const allElement = allNote.concat(allTodo);
        allElement.forEach(item => {
            if(item.tags.includes(query) && item.public){
                results.push(item);
            }
        });
    }else{
        const searchResultsNote = await Note.find({
            user: u,
            [filter]: {$regex: new RegExp(query,'i')} 
        });
        const searchResultsTodo = await Todo.find({
            user: u,
            [filter]: {$regex: new RegExp(query,'i')}
        });
        searchResultsNote.concat(searchResultsTodo).forEach(item => {
            if(item.public){
                results.push(item);
            }
        });
    }
    return results;
}

async function asyncFunc(user,filter,query){
    const results = await realFunc(user,filter,query);
    return results;
}

async function processUsers(users,filter,query){
    const promises = users.map(user => asyncFunc(user,filter,query));
    const results = await Promise.all(promises);
    return results.flat();
}

app.get('/search',async (req,res) => {
    if(!req.query.query){
        return res.status(400).send("Query parameter is required");
    }
    try{
        const query = req.query.query;
        const filter = req.query.f;
        friendSearch = req.query.fs;
        var users;
        if(friendSearch == 'true'){
            users = currentUser.friends;
        }else{
            users = [currentUser.name];
        }

        const searchResults = await processUsers(users,filter,query);

        res.json(searchResults);
        
    }catch(error){
        console.log('Search error: ',error);
        res.status(500).send('Error performing search');
    }
});

app.post("/:blogType/delete/:id",async (req,res) => {
    try{
        var r;
        if(req.params.blogType == "Notes"){
            r = await Note.findByIdAndDelete(req.params.id);
        }else{
            if(req.params.id == "all"){
                r = await Todo.find({});
                for(let i=0;i<r.length;i++){
                    await Todo.findByIdAndDelete(r[i]._id);
                }
            }else{
                r = await Todo.findByIdAndDelete(req.params.id);
            }
        }
        if(!r){
            return res.status(404).send("Element not found");
        }
        var link = "/show" + req.params.blogType;
        res.redirect(link);
    }catch(error){
        console.log(error);
        res.status(500).send("Error deleting element");
    }
});

app.post("/todo/:id/tasks/:task/delete", async (req,res) => {
    try{
        var r = await Todo.findById(req.params.id);
        if(!r){
            return res.status(404).send("Todo not found");
        }
        r.tasks.splice(req.params.task,1);
        r.completed.splice(req.params.task,1);

        await Todo.findOneAndUpdate({_id: req.params.id},{tasks: r.tasks, completed: r.completed});
        res.redirect(`/${r.author}/showTodos`);
    }catch(error){
        console.log(error);
        res.status(500).send("Error fetching Todo");
    }
});

app.post("/todo/:id/tasks/:task/completed", async (req,res) => {
    try{
        var r = await Todo.findById(req.params.id);
        if(!r){
            return res.status(404).send("Todo not found");
        }
        var comp = r.completed;
        comp[req.params.task] = true;
        await Todo.findByIdAndUpdate({_id: req.params.id},{completed: comp});
        res.redirect(`/${r.author}/showTodos`);
    }catch(error){
        console.log(error);
        res.status(500).send("Error fetching Todo");
    }
});

app.listen(3000, () =>{
    console.log("App listening on port 3000");
});