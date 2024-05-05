const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const _ = require("lodash");
const cors = require('cors')
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
    heading: String,
    content: String,
    author: String,
    date: {type: Date, default: Date.now()},
    place: String,
    tags: [String],
    el_type: {type: String, default: "notes"}
});

const todoSchema = new mongoose.Schema({
    heading: String,
    tasks: [String],
    author: String,
    date: {type: Date, default: Date.now()},
    completed: [Boolean],
    place: String,
    tags: [String],
    el_type: {type: String, default: "Todo"}
});

const Note = mongoose.model("Note",noteSchema);
const Todo = mongoose.model("Todo",todoSchema);


app.get("/",async (req,res) => {
    const note = await Note.find({}).limit(3);
    const todo = await Todo.find({}).limit(3);
    res.render("home",{notes: note, todos: todo});
});

app.get("/showNotes",async (req,res) => {
    const notes = await Note.find({});
    res.render("note_page",{notes});
});

app.get("/showTodos",async (req,res) => {
    const todos = await Todo.find({});
    res.render("todo_page",{todos});
});

app.get("/compose",(req,res) => {
    res.render("compose",{todo: null});
});

app.post("/compose", async (req,res) => {
    if(req.body.typeNote == "note"){
        var newNote = new Note({
            heading: req.body.title,
            content: req.body.post,
            author: req.body.author,
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
            console.log("Vecchie pos completed todo: " + oldComp);
            console.log("Nuove pos completed todo: " + newComp);
            todo.tasks = newTasks;
            todo.author = req.body.author;
            todo.completed = [];
            for(let i=0;i<todo.tasks.length;i++){
                todo.completed.push(newComp.includes(i));
            }
            todo.place = req.body.place;
            todo.tags = req.body.tags.split(",").map(tag => tag.trim());

            flag = true;
        }else{
            newTodo = new Todo({
                heading: req.body.title,
                tasks: req.body.post.split("\n").map(task => task.trim()),
                author: req.body.author,
                completed: Array(req.body.post.split("\n").length).fill(false),
                place: req.body.place,
                tags: req.body.tags.split(",").map(tag => tag.trim())
            });
            if(newTodo.tasks[0] == ""){
                newTodo.tasks = [];
            }
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

app.get("/notes/:noteName",async (req,res) => {
    try{
        const noteName = decodeURIComponent(req.params.noteName);
        const note = await Note.findOne({ heading: new RegExp('^' + _.escapeRegExp(noteName) + '$', 'i')});
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

app.get('/search',async (req,res) => {
    if(!req.query.query){
        return res.status(400).send("Query parameter is required");
    }
    try{
        const query = req.query.query;
        const filter = req.query.f;
        var searchResults = [];
        if(filter == "tag"){
            const allNote = await Note.find({});
            const allTodo = await Todo.find({});
            const allElement = allNote.concat(allTodo);
            allElement.forEach(item => {
                if(item.tags.includes(query)){
                    searchResults.push(item);
                }
            });
        }else{

            const searchResultsNote = await Note.find({
                [filter]: {$regex: new RegExp(query,'i')} 
            }).limit(3);
            const searchResultsTodo = await Todo.find({
                [filter]: {$regex: new RegExp(query,'i')}
            }).limit(3);

            searchResults = searchResultsNote.concat(searchResultsTodo);
        }
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
        res.redirect("/showTodos");
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
        res.redirect("/showTodos");
    }catch(error){
        console.log(error);
        res.status(500).send("Error fetching Todo");
    }
});

app.listen(3000, () =>{
    console.log("App listening on port 3000");
});