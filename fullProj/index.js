const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { type } = require("os");
const bodyParser = require("body-parser");
const { rmSync } = require("fs");
const { ConnectionClosedEvent, ConnectionPoolClosedEvent } = require("mongodb");

const passport = require('passport');
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const mongoDBUri = process.env.MONGODB_URI;
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

const User = require('./userModel');
const { Message } = require('./messageModel');

let flag = true;

initializePassport(passport);

app.use(cors());
app.set("view engine");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());

app.use(bodyParser.json());

const noteSchema = new mongoose.Schema({
    user: String,
    public: Boolean,
    heading: String,
    content: String,
    date: { type: Date },
    place: String,
    tags: [String],
    view_list: { type: [String], default: [] },
    todo_children: { type: [String], default: [] },//array dove salvare gli id dei to-do creati nel corpo della nota per eventuali modifiche
    el_type: { type: String, default: "notes" }
});

const todoSchema = new mongoose.Schema({
    parent_id: String,//id della nota da cui è stato creato il to-do
    user: String,
    public: Boolean,
    heading: String,
    tasks: [String],
    date: { type: Date },
    completed: [Boolean],
    place: String,
    tags: [String],
    el_type: { type: String, default: "Todo" }
});

const sessionSchema = new mongoose.Schema({
    user: String,
    studyTime: Number,
    restTime: Number,
    totCycles: Number,
    completedCycles: Number,
    state: { type: String, default: "idle" },
    dateTime: { type: Date }
});

const eventSchema = new mongoose.Schema({
    owner: String,
    participants: { type: [String], default: [] },
    participants_state: { type: [String], default: [] },          /* "waiting" per non ha ancora accettato, "refused" per ha rifiutato e "accepted" per ha accettato */
    title: String,
    date_start: Date,                      /* data e ora di inizio */
    date_end: Date,
    is_recurring: Boolean,                 /* Vero se l'evento è ricorrente */
    recurring_rule: String,                /* Stringa che descrive la ricorrenza, in standard iCalendar(RFC 5545) */
    all_day: Boolean,
    place: String,
    notification_advance: Number,           /* anticipo in minuti nella notifica */
    notification_repetitions: Number,       /* 0 per infinite*/
    notification_interval: Number,          /* numero di minuti tra una notifica e la successiva */
    notification_modes: [String],
    notification_stop: Boolean,             /* Falso per notifiche non ancora fermate, vero per notifiche fermate */
    ev_type: { type: String, default: "Event" }                            /* "notAvailable" per indicare non disponibilità ad eventi di gruppo*/
});

const activitySchema = new mongoose.Schema({
    owner: String,
    participants: [String],
    participants_state: { type: [String], default: [] },          /* "waiting" per non ha ancora accettato, "refused" per ha rifiutato e "accepted" per ha accettato */
    title: String,
    end: Date,
    creation_date: Date,
    has_deadline: Boolean,
    is_completed: Boolean
});

const Note = mongoose.model("Note", noteSchema);
const Todo = mongoose.model("Todo", todoSchema);
const Session = mongoose.model("Session", sessionSchema);
const Event = mongoose.model("Event", eventSchema);
const Activity = mongoose.model("Activity", activitySchema);

var currentUser = null;

/*[SETUP PER SERVER DISI] !!!!!CAMBIARE PORTA DEL SERVER DA 3000 A 8000!!!!!!!!!!!!!!!
global.rootDir = __dirname;

app.use('/js',express.static(global.rootDir + '/public/js'));
app.use('/css',express.static(global.rootDir + '/public/css'));
app.use('/fonts',express.static(global.rootDir + '/public/fonts'));
app.use('/img',express.static(global.rootDir + '/public/img'));

app.get('/',async function (req,res){
    res.sendFile(path.join(__dirname,'public','index.html'));
});

app.get('*',async function (req,res){
    res.sendFile(path.join(__dirname,'public','index.html'));
});
*/

app.post("/getUser", (req, res) => {
    if (currentUser)
        res.json({ name: currentUser.name });
    else res.json(undefined);
});

//gestione richiesta post per richiedere un preciso to-do o una precisa nota inviando l'ID
app.post("/:blogType/get", async (req, res) => {
    var { ID } = req.body;
    var todo, note;
    try {
        if (req.params.blogType == "todos") {
            todo = await Todo.find({ _id: ID });
            res.send(todo);
        } else {
            note = await Note.find({ _id: ID });
            res.send(note);
        }
    } catch (error) {
        res.status(404).send("Element not found");
    }

});

app.post("/getNotes/latest", async (req, res) => {
    const user = req.body.user;
    const now = req.body.now ? req.body.now : new Date().getTime();

    try {
        var userNotes = await Note.find({ user: user }).sort({ date: "descending" });
        let done = false;

        //Check each note from the most recent to the oldest. If the currently checked note was the latest session before "now", send its info.
        //Necessary in order to account for time machine (otherwise it would have just sent userNotes[0]).
        for (const note of userNotes) {
            if (note.el_type == "notes" && note.date <= now) {
                res.send(note);
                done = true;
                break;
            }
        }

        //Either no previous session exists, or none of them are before the time considered as "now"
        if (!done) res.json(undefined);

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while reading latest note");
    }
});

app.post("/getNotes/oldest", async (req, res) => {
    const user = req.body.user;
    const now = req.body.now ? req.body.now : new Date().getTime();
    try {
        var userNotes = await Note.find({ user: user }).sort({ date: "ascending" });

        //Either no note exists, or none of them are before the time considered as "now"
        if (userNotes.length == 0 || userNotes[0].date > now) {
            res.json(undefined);
        }
        else {
            res.send(userNotes[0]);
        }

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while reading oldest note");
    }
});

//gestione richiesta post per richiedere un numero di note (con limit = -1 si ottengono tutte le note) 
app.post("/getNotes/:limit", async (req, res) => {
    var lim = Number(req.params.limit);
    var note;
    if (lim > 0) {
        note = await Note.find({ user: req.body.ID }).limit(lim);
    } else {
        note = await Note.find({ user: req.body.ID });
    }
    res.send(note);
});

//gestione richiesta post per richiedere un numero di to-do (con limit = -1 si ottengono tutti i to-do)
app.post("/getTodos/:limit", async (req, res) => {
    var lim = Number(req.params.limit);
    var todo;
    if (lim > 0) {
        todo = await Todo.find({ user: currentUser.name }).limit(req.params.limit);
    } else {
        todo = await Todo.find({ user: currentUser.name });
    }
    res.send(todo);
});

//gestione richiesta post per aggiungere o modificare note e to-do
app.post("/compose", async (req, res) => {
    var { ID, parent_id, heading, content, tags, place, public, post_type, todo_children, author, share, date } = req.body;
    var savedDocument;
    var user;
    flag = true;

    try {
        user = await User.findOne({ name: author });
        if (!user) {
            res.status(404).send("Error user creating post not found");
        }
    } catch (error) {
        res.status(500).send("Error while fetching user who create post");
    }

    //la tipologia del post viene riconosciuta con il valore di post_type (0 per le  e 1 per i to-do)
    if (post_type == 0) {
        //se il parametro ID è != da null viene gestita una richiesta di modifica della nota
        //viene quindi cercata e modificata
        //altrimenti viene crata una nuova nota
        if (ID != null) {
            try {
                var note = await Note.findOne({ _id: ID });

                note.heading = heading;
                note.content = content;
                note.place = place;
                note.public = public;

                note.tags = tags.split(",").map(tag => tag.trim()).filter(item => item != "");

                if (share.length > 0) {
                    var u = share.split("-");
                    if (u.length >= note.view_list.length) {
                        u = u.filter(e => !note.view_list.includes(e));
                        u.forEach(e => note.view_list.push(e));
                        share = u.join('-');
                    } else {
                        del_friends = note.view_list.filter(e => !u.includes(e));
                        note.view_list = note.view_list.filter(e => !del_friends.includes(e));
                        share = "";
                    }
                }


            } catch (error) {
                console.log("Error fetching note to modify: ", error);
            }
        } else {
            var newNote = new Note({
                user: author,
                public: public,
                heading: heading,
                content: content,
                place: place,
                tags: tags.split(',').map(tag => tag.trim()),
                date: date
            });
        }
    } else {
        //modifica o creazione dei to-do gestita ugualmente a quella delle note
        //con le opportune differenze per la gestione dei campi per i to-do
        //ovvero separazione dei task e la gestione dei task completati
        if (ID != null) {
            try {
                var todo = await Todo.findOne({ _id: ID });

                todo.heading = heading;
                var newTasks = content.split("\n").map(task => task.trim()).filter(item => item != "");
                var oldComp = [];
                var newComp = [];
                for (let i = 0; i < todo.completed.length; i++) {
                    if (todo.completed[i]) {
                        oldComp.push(i);
                    }
                }
                oldComp.forEach(index => {
                    if (newTasks.includes(todo.tasks[index])) {
                        newComp.push(newTasks.indexOf(todo.tasks[index]));
                    }
                });
                todo.tasks = newTasks;
                todo.completed = [];
                for (let i = 0; i < todo.tasks.length; i++) {
                    todo.completed.push(newComp.includes(i));
                }
                todo.place = place;
                todo.tags = tags.split(",").map(tag => tag.trim()).filter(item => item != "");
                todo.public = public;

            } catch (error) {
                console.log("Error while fetching to-do: ", error);
            }
        } else {
            var newTodo = new Todo({
                parent_id: parent_id,
                user: author,
                public: public,
                heading: heading,
                tasks: content.split("\n").map(task => task.trim()).filter(item => item !== ""),
                completed: Array(content.split("\n").length).fill(false),
                place: place,
                date: date,
                tags: tags.split(",").map(tag => tag.trim())
            });
        }
    }

    try {
        //divisione del salvataggio sempre in base al tipo di post da salvare
        if (post_type == 0) {
            //ulteriore divisione per la modifica e la creazione delle note
            if (ID != null) {
                savedDocument = await note.save();
                //nel caso della modifica di una nota nella risposta da parte del server viene inviata anche la lista degli ID dei to-do creati dentro alla nota
                //insieme anche all'ID della nota appena modificata
                //!!!NOTA!!! --> NON FUNZIONA
                if (savedDocument.todo_children.length > 0) {
                    res.json({
                        message: "Modify todo children",
                        t_child: savedDocument.todo_children,
                        parent_id: savedDocument._id
                    });
                }
            } else {
                flag = false;
                savedDocument = await newNote.save();
                res.send({ message: "OK" });
            }
            //se la richiesta era per la creazione di una nuova nota allora nella risposta dal server viene aggiunto l'ID della nota appena creata 
            //servirà durante la creazione dei to-do (se presenti)
            if (todo_children && !savedDocument.todo_children.length) {
                res.json({
                    message: "Add todo children",
                    id: savedDocument._id
                });
            }
            if (!todo_children && flag) {
                res.send({ message: "OK" });
            }
        } else {
            //uguale divisione per creazione e modifica
            if (ID != null) {
                savedDocument = await todo.save();
                res.send({ message: "OK" });
            } else {
                savedDocument = await newTodo.save();
                //se il nuovo to-do è stato creato a partire da una nota viene salvato all'interno del to-do l'ID del padre
                if (parent_id) {
                    var p_nota = await Note.findById(parent_id);
                    p_nota.todo_children.push(savedDocument._id);
                    p_nota.save();
                }
                res.json({ message: "fine" });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving Note");
    }

    var friends = [];

    if (share.length > 0) {
        friends = share.split('-');
        friends.forEach(async (friend) => {
            try {
                var f = await User.findOne({ name: friend });
                if (!f) {
                    res.status(404).send("New friend not found");
                }
            } catch (error) {
                res.status(500).send("Error fetching new friend while compose");
            }
            var m;
            if (!(user.friends.includes(friend))) {
                m = new Message({
                    from: user.name,
                    type: 'amicizia',
                });
                f.inbox.push(m);
                await m.save();
            }
            m = new Message({
                from: user.name,
                type: 'condivisione',
                data: savedDocument._id
            });
            f.inbox.push(m);
            await m.save();
            await f.save();
        });
    }
});

//gestione richiesta post per contrassegnare un task come completato
//viene cercato il to-do e modificato il valore all'indice corrispondente del task nell'array completed
//l'ID del to-do e l'indice del task vengono passati come payload alla richiesta
app.post("/todos/tasks/check", async (req, res) => {
    const { todo_id, task_index } = req.body;
    try {
        var r = await Todo.findById(todo_id);
        if (!r) {
            res.status(404).send("Todo not found");
        }
        var comp = r.completed;
        comp[task_index] = true;
        await Todo.findByIdAndUpdate({ _id: todo_id }, { completed: comp });
        res.json({ message: "OK" });
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while fetching todo");
    }
});

//gestione richiesta post per la cancellazione di un task
//viene cercato il to-do e vengono eliminati dagli array tasks e completed i valori all'indice del task
//l'ID del to-do e l'indice del task vengono passati come payload alla richiesta
app.post("/todos/tasks/delete", async (req, res) => {
    const { todo_id, task_index } = req.body;
    try {
        var r = await Todo.findById(todo_id);
        console.log("todo trovato");
        if (!r) {
            return res.status(404).send("Todo not found");
        }

        var n = await Note.findById(r.parent_id);
        if (!n) {
            return res.status(404).send("Nota padre not found");
        }

        var todo_index = n.todo_children.indexOf(todo_id);
        var content_rows = n.content.split('\n');
        var n_todo = 0;
        console.log("fino a qui tutto bene");
        for (let i = 0; i < content_rows.length; i++) {
            if (n_todo == (todo_index * 2) + 1) {
                if (content_rows[i].includes(r.tasks[task_index])) {
                    content_rows.splice(i, 1);
                }
            } else if (n_todo > (todo_index * 2) + 1) {
                break;
            }
            if (content_rows[i].includes("[todo]")) {
                n_todo++;
            }
        }

        n.content = content_rows.join('\n');

        r.tasks.splice(task_index, 1);
        r.completed.splice(task_index, 1);

        await Todo.findOneAndUpdate({ _id: todo_id }, { HTMLcontent: r.HTMLcontent, tasks: r.tasks, completed: r.completed });
        await Note.findOneAndUpdate({ _id: r.parent_id }, { content: n.content });

        res.send({ message: "OK" });
    } catch (error) {
        res.status(500).send("Error while fetching todo");
    }
});


app.post("/pomodoro/sessions/create", async (req, res) => {
    try {
        const { _id, user, ...data } = req.body;
        const newSession = new Session({
            user: user,
            state: "idle",
            completedCycles: 0,
            ...data
        });
        await newSession.save();
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while creating session");
    }
});

app.post("/pomodoro/sessions/read", async (req, res) => {
    const { _id } = req.body;
    try {
        var target = await Session.findById(_id);
        if (!target) {
            res.status(404).send("Session not found");
        }
        else {
            res.json(target);
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while reading session");
    }
});

// POST request to get informations on the latest pomodoro session. Note: to access the information, read the .data field of the received JSON.
// Sends undefined if there are no previously created sessions for the current user.
app.post("/pomodoro/sessions/read/latest", async (req, res) => {
    const user = req.body.user;
    const now = req.body.now ? req.body.now : new Date().getTime();
    //console.log("req.body: ", req.body);
    //console.log("user: ", user);
    //console.log("now: ", now);

    try {
        var userSessions = await Session.find({ user: user }).sort({ dateTime: "descending" });


        //Check each session from the most recent to the oldest. If the currently checked session was the latest session before "now", send its info.
        //Necessary in order to account for time machine (otherwise it would have just sent userSession[0]).
        //When time machine is implemented, TODO: change initialization of "now" constant above
        for (const session of userSessions) {
            if (session.dateTime < now) {
                res.json(session);
                return;
            }
        }

        //Either no previous session exists, or none of them are before the time considered as "now"
        res.json(undefined);

    } catch (error) {
        console.log("Error while reading latest pomodoro session: ", error);
        res.json(undefined);
    }
});

// POST request to get informations on the stats of the last week of pomodoro sessions. Note: to access the information, read the .data field of the received JSON.
app.post("/pomodoro/sessions/read/week_stats", async (req, res) => {
    const user = req.body.user;
    const now = req.body.now ? req.body.now : new Date().getTime();

    const weekStats = {
        sessionsCount: 0,
        cyclesCount: 0,
        completedSessionsCount: 0,
        completedCyclesCount: 0,
        percentOfCompletedSessions: 0,
        percentOfCompletedCycles: 0,
    };
    try {
        var userSessions = await Session.find({ user: user });
        const weekAgo = now - 604800000; //604800000 milliseconds = 1 week
        const weekSessions = userSessions.filter(session => session.dateTime >= weekAgo && session.dateTime <= now);
        for (const session of weekSessions) {
            weekStats.sessionsCount++;
            weekStats.cyclesCount += session.totCycles;
            if (session.completedCycles == session.totCycles) weekStats.completedSessionsCount++;
            weekStats.completedCyclesCount += session.completedCycles;
        }
        weekStats.percentOfCompletedSessions = weekStats.sessionsCount > 0 ? weekStats.completedSessionsCount / weekStats.sessionsCount * 100 : 100;
        weekStats.percentOfCompletedCycles = weekStats.cyclesCount > 0 ? weekStats.completedCyclesCount / weekStats.cyclesCount * 100 : 100;
        res.json(weekStats);
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while reading session");
    }
});

app.post("/pomodoro/sessions/update", async (req, res) => {
    const { _id, ...data } = req.body;
    try {
        var target = await Session.findById(_id);
        if (!target) {
            res.status(404).send("Session not found");
        }
        else {
            await Session.findByIdAndUpdate(_id, data);
            res.json({ message: "OK" });
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while updating session");
    }
});

app.post("/pomodoro/sessions/delete", async (req, res) => {
    const { _id } = req.body;
    try {
        var target = await Session.findById(_id);
        if (!target) {
            res.status(404).send("Session not found");
        }

        await Session.findByIdAndDelete(_id);

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send("Error while deleting session");
    }
});

//gestione richiesta post per la cancellazione di un post
app.post("/:blogType/delete", async (req, res) => {
    var r;
    //l'ID del post viene passato come payload 
    const { ID } = req.body;
    try {
        //la tipologia del post viene passata all'interno dell'URL della richiesta
        if (req.params.blogType == "Notes") {
            r = await Note.findByIdAndDelete(ID);
        } else {
            var t = await Todo.findOne({ _id: ID });
            if (t.parent_id) {
                console.log("cancello id todo da lista figli del padre");
                var n = await Note.findOne({ _id: t.parent_id });
                n.todo_children = n.todo_children.filter(child => child != ID);
                await n.save();
            }
            r = await Todo.findByIdAndDelete(ID);
        }
        if (!r) {
            return res.status(404).send("Element not found");
        }
        res.send("OK");
    } catch (error) {
        console.log("ERRORE: ", error);
        res.status(500).send("Error deleting element");
    }
});

//gestione richiesta post per la duplicazione di una nota
//la nota viene cercata e viene poi creata una nuova nota utilizzando i valori di quella già presente
//l'ID della nota viene passato nell'URL della richiesta
app.post("/duplicateNote/:id", async (req, res) => {
    try {
        var n = await Note.findById(req.params.id);
        if (!n) {
            return res.status(404).send("Element not found");
        }

        var note = new Note({
            user: n.user,
            public: n.public,
            heading: n.heading,
            content: n.content,
            place: n.place,
            tags: n.tags
        });
        try {
            await note.save();
        } catch (error) {
            return res.status(500).send("Error while saving duplicate note");
        }
        res.send("OK");
    } catch (error) {
        return res.status(500).send("Error while fetching note");
    }
});



app.get("/user/checkLogged", (req, res) => {
    res.json({ message: currentUser != null ? "true" : "false" });
});

app.get("/user/logout", (req, res) => {
    currentUser = null;
    res.json({ message: "OK" });
});

app.get('/user/addFriend', async (req, res) => {
    console.log("GESTISCO RICHIESTE AMICI");
    try {
        console.log("req.query: ", req.query);
        var friend_username = req.query.user;
        var user = req.query.ID;
        var action = req.query.action;

        console.log("aagiungo richiesta di amicizia all'inbox di: ", friend_username);

        var friend = await User.findOne({ name: friend_username });
        var me = await User.findOne({ name: user });
        if (!me.friends.includes(friend.name)) {
            if (action == "remove") {
                res.status(404).send("Amico non trovato, impossibile rimuovere");
            } else {
                var old_inbox = friend.inbox;

                var newMessage = new Message({
                    from: user,
                    type: 'amicizia'
                });

                old_inbox.push(newMessage);

                const r = await User.findByIdAndUpdate({ _id: friend._id }, { inbox: old_inbox });
                await newMessage.save();
                res.send("OK");
            }
        } else {
            if (action == "remove") {
                console.log("L'AMICO è PRESENTE E VOGLIO ELIMINARLO");
                console.log("LISTA DI AMICI PRIMA DI ELIMINAZIONE: ");
                console.log(me.friends);
                let new_friends = [];
                me.friends.forEach(f => {
                    if (f != friend_username) {
                        new_friends.push(f);
                    }
                });
                me.friends = new_friends;
                console.log("LISTA DI AMICI DOPO ELIMINAZIONE: ");
                console.log(me.friends);
                console.log("LISTA DI AMICI AMICO PRIMA DI ELIMINAZIONE: ");
                console.log(friend.friends);

                new_friends = [];
                friend.friends.forEach(f => {
                    if (f != me.name) {
                        new_friends.push(f);
                    }
                });
                friend.friends = new_friends;
                console.log("LISTA DI AMICI AMICO DOPO ELIMINAZIONE: ");
                console.log(friend.friends);

                await User.findByIdAndUpdate({ _id: me._id }, { friends: me.friends });
                await User.findByIdAndUpdate({ _id: friend._id }, { friends: friend.friends });
                res.send("OK");
            }
        }
    } catch (error) {
        console.log("Errore nell'agigunta di un amico: ", error);
        res.status(500).send("Errore del server");
    }
});

app.get("/user/checkInbox", async (req, res) => {
    var username = req.query.user;

    try {
        try {
            var user = await User.findOne({ name: username });
            if (!user) {
                res.status(404).send("User not found");
            }
        } catch (error) {
            res.status(500).send("Error while fetching user for messages");
            console.log("ERRORE: ", error);
        }

        var newMessages = user.inbox.filter(msg => msg.seen == false);
        if (newMessages.length > 0) {
            res.send({ message: true });
        } else {
            res.send({ message: false });
        }
    } catch (error) {
        console.log("Error fetching user for inbox check: ", error);
    }
});

app.get("/user/getMessages", async (req, res) => {
    var username = req.query.user;
    try {
        var user = await User.findOne({ name: username });
        if (!user) {
            res.status(404).send("User not found");
        }

        res.json(user.inbox);
    } catch (error) {
        res.status(500).send("Error fetching user for messages");
    }
});

app.post("/user/checkMessages", async (req, res) => {
    var username = req.body.u;
    var messages = req.body.messages;
    for (let m of messages) {
        console.log(m);
    }

    var user = await User.findOne({ name: username });

    user.inbox.map(msg => msg.seen = true);
    await user.save();

    messages.forEach(async (msg) => {
        var m = await Message.findOne({ _id: msg._id });
        m.seen = true;
        await m.save();
    });
    res.send({ message: "OK" });
});

/*function delete_msg(ID){

}*/

app.post("/user/messages/:msgID/accept", async (req, res) => {
    try {
        var msg = await Message.findOne({ _id: req.params.msgID });
        var fromUser = await User.findOne({ name: msg.from });
        var toUser = await User.findOne({ name: req.body.u });

        if (msg.type == "amicizia") {
            console.log(`accetto richiesta di amicizia`);
            fromUser.friends.push(toUser.name);
            toUser.friends.push(fromUser.name);
        } else if (msg.type == "condivisione") {
            console.log("accetto richiesta di condivisione");
            var note = await Note.findOne({ _id: msg.data });
            note.view_list.push(toUser.name);
            await note.save();
        }
        console.log("messaggi dentro l'inbox: ");
        for (let m of toUser.inbox) {
            console.log(String(m._id));
            console.log(m);
        }
        console.log("id del messaggio da eliminare: ");
        console.log(String(msg._id));

        let new_inbox = [];
        toUser.inbox.forEach(m => {
            if (m.from != fromUser.name || m.type != msg.type) {
                new_inbox.push(m);
            }
        })
        toUser.inbox = new_inbox;

        console.log("messaggio dentro all'inbox dopo eliminazione: ");
        for (let m of toUser.inbox) {
            console.log(m);
        }

        await Message.findByIdAndDelete({ _id: msg._id });
        await User.findByIdAndUpdate({ _id: toUser._id }, { friends: toUser.friends, inbox: toUser.inbox });
        await User.findByIdAndUpdate({ _id: fromUser._id }, { friends: fromUser.friends });

        res.send({ message: "OK" });
    } catch (error) {
        res.status(500).send("Error while fetching msg and users for accepting message");
    }
});

app.post("/user/messages/:msgID/delete", async (req, res) => {
    console.log(req.body.u);
    try {
        var msg = await Message.findOne({ _id: req.params.msgID });
        var toUser = await User.findOne({ name: req.body.u });

        console.log("UTENTE DA CUI ELIMINARE IL MESSAGGIO: ", toUser.name);
        console.log("INBOX UTENTE: ", toUser.inbox);
        console.log("MESSAGGIO DA ELIMINARE: ", msg);

        toUser.inbox.pop(toUser.inbox.findIndex((m) => {
            return m._id == msg._id;
        }));
        console.log("NUOVA INBOX DELL'UTENTE: ", toUser.inbox);
        await Message.findByIdAndDelete({ _id: msg._id });
        await User.findByIdAndUpdate({ _id: toUser._id }, { inbox: toUser.inbox });
        res.send({ message: "OK" });
    } catch (error) {
        res.status(500).send("Error while fetching msg and user for message deleting");
    }
});

app.get("/user/info/:user", async (req, res) => {
    try {
        var u = await User.findOne({ name: req.params.user });

        if (!u) {
            res.status(404).send("Utente non trovato");
        }

        res.json(u);
    } catch (error) {
        res.status(500).send("Errore (nel server) durante il fetch dell'utente per le info");
    }
});

//gestione richiesta post per il login/register di un utente
//la tipologia della registrazione viene passata nell'URL della richiesta
//alla fine della gestione della richiesta se non ci sono stati errori l'utente viene salvato nella variabile currentUser utilizzata per le operazioni e i display dei post
app.post("/user/:regType", async (req, res, next) => {
    var newUser = null;
    var user = null;

    if (req.params.regType == "Login") {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.log("errore login in index");
                return next(err);
            }
            if (!user) return res.status(400).send(info.message);
            const token = jwt.sign(user.name, 'SECRET_KEY');
            currentUser = user.name;
            return res.json({ token });
        })(req, res, next);
    } else {
        x = await User.findOne({ name: req.body.username });
        //se viene effettuata una registrazione di un nuovo utente ma è già presente un utente con quel nome nel database la richiesta non viene effettuata
        if (x) {
            res.json({
                message: "already user"
            });
        } else {
            var password = await bcrypt.hash(req.body.password, 10);
            var newUser = new User({
                name: req.body.username,
                passw: password
            });
            try {
                await newUser.save();
                res.json({ message: "OK" });
            } catch (error) {
                res.status(500).send("Error saving new user");
            }
        }
    }
});

//---------------------------------------------------------------
//funzioni per la gestione della ricerca 
//!!!NOTA!!! --> NON TESTATE
async function realSearch(u, filter, query, searchUser) {
    let results = [];
    if (filter == "tag") {
        const allNote = await Note.find();
        //aggiungere todo
        allNote.forEach(item => {
            if (item.tags.includes(query)) {
                results.push(item);
            }
        });
        if (searchUser != "") {
            results = results.filter(item => item.user == u && item.view_list.includes(searchUser));
        } else {
            results = results.filter(item => item.user == u || item.view_list.includes(u));
        }
    } else if (filter == "friends") {
        const users = await User.find({
            name: { $regex: new RegExp(query, 'i') }
        });
        users.forEach(user => {
            if (user.friends.includes(u)) {
                results.push(user);
            }
        });
    } else {
        const resultsNote = await Note.find({
            [filter]: { $regex: new RegExp(query, 'i') }
        });
        console.log(`[DEBUG] RESULT: ${resultsNote}`);
        console.log(searchUser);
        //aggiungere todo
        if (searchUser != "") {
            resultsNote.forEach(note => {
                if (note.user == u && note.view_list.includes(searchUser)) {
                    results.push(note);
                }
            })
        } else {
            resultsNote.forEach(note => {
                if (note.user == u || note.view_list.includes(u)) {
                    results.push(note);
                }
            })
        }
    }
    return results;
}

async function asyncFunc(user, filter, query, searchUser) {
    const results = await realSearch(user, filter, query, searchUser);
    return results;
}

async function processUsers(users, filter, query, searchUser) {
    const promises = users.map(user => asyncFunc(user, filter, query, searchUser));
    const results = await Promise.all(promises);
    return results.flat();
}

app.post('/search', async (req, res) => {
    if (!req.body.query) {
        res.status(400).send("Query parameter is required");
    }
    try {
        const query = req.body.query;
        const filter = req.body.filter;
        const friends = req.body.friends;
        const user = await User.findOne({ name: req.body.user });

        var users;
        var searchUser = "";
        if (friends == true) {
            users = user.friends;
            searchUser = user.name;
        } else {
            users = [user.name];
        }

        console.log(`[DEBUG] FACCIO IL PROCESS DEGLI USERS CON: ${users} - ${filter} - ${query} - ${searchUser}`);
        const searchResults = await processUsers(users, filter, query, searchUser);

        res.json(searchResults);
    } catch (error) {
        console.log("Search error: ", error);
        res.status(500).send("Error while search");
    }
});
//-----------------------------------------------------------------------

//gestione richiesta post per richiedere un evento di un utente (con eventId = -1 si ottengono tutti gli eventi di quell'utente)
app.get("/getEvents/:userName/:eventId", async (req, res) => {
    var userName = req.params.userName;
    var eventId = req.params.eventId
    console.log("/getEvents/:userName/:eventId  " + userName + " " + eventId);
    var events;
    if (eventId == "-1") {
        events = await Event.find({ owner: userName });
    } else {
        events = await Event.find({ owner: userName, _id: eventId });
    }
    console.log("return #" + events.length + " events");
    res.send(events);
});
//gestione richiesta post per l'aggiunta di un'evento
app.post("/addEvent", async (req, res) => {
    console.log("/addEvent " + req.body);
    const { userName, title, date_start, date_end, place, participants, all_day, is_recurring, recurring_rule, ev_type } = req.body;
    const NewEvent = new Event({
        owner: userName,
        title: title,
        date_start: date_start,
        date_end: date_end,
        place: place,
        participants: participants,
        all_day: all_day,
        is_recurring: is_recurring,
        recurring_rule: recurring_rule,
        ev_type: ev_type
    });
    try {
        await NewEvent.save();
        console.log("added event= " + NewEvent);
        res.json({ message: "OK" });
    } catch (error) {
        console.error("Errore nella creazione dell'evento: ", error);
        res.status(500).send("Error saving new activity");
    }
});
//gestione richiesta post per la modifica di un'evento
app.post("/editEvent", async (req, res) => {
    console.log("/editEvent " + req.body);
    const { userName, eventId, title, date_start, date_end, place, participants, all_day, is_recurring, recurring_rule, ev_type } = req.body;
    console.log("ricerca di eventId=" + req.body.eventId);
    var event_ = await Event.findOne({ _id: eventId, owner: userName });
    if (!event_) {
        res.json({
            message: "event not found"
        });
    } else {
        event_.title = title;
        event_.date_start = date_start;
        event_.date_end = date_end;
        event_.place = place;
        event_.participants = participants;
        event_.all_day = all_day;
        event_.is_recurring = is_recurring;
        event_.recurring_rule = recurring_rule;
        event_.ev_type = ev_type;
        try {
            await event_.save();
            res.json({ message: "OK" });
            console.log("saved:" + event_);
        } catch (error) {
            console.error("Errore nel salvataggio dell'evento: ", error);
            res.status(500).send("Error modifying event");
        }
    }
});
//gestione richiesta post per la cancellazione di un evento
app.post("/deleteEvent", async (req, res) => {
    console.log("/deleteEvent " + req.body);
    const { userName, eventId } = req.body;
    console.log("ricerca di eventId=" + req.body.eventId);
    try {
        var event_ = await Event.findOne({ _id: eventId, owner: userName });
        if (!event_) {
            console.log("Evento non trovato: " + eventId);
            res.json({
                message: "event not found"
            });
        } else {
            r = await Event.findByIdAndDelete(eventId);
            console.log("cancellato:" + eventId);
            //if(!r){
            //	return res.status(404).send("Event not found");
            //}
            res.json({ message: "OK" });
        }
    } catch (error) {
        console.log("ERRORE: ", error);
        res.status(500).send("Error deleting event");
    }
});
//gestione richiesta post per richiedere un'attività di un utente (con activityId = -1 si ottengono tutte le attività di quell'utente)
app.get("/getActivities/:userName/:activityId", async (req, res) => {
    var userName = req.params.userName;
    var activityId = req.params.activityId
    console.log("/getActivities/:userName/:activityId  " + userName + " " + activityId);
    var activities;
    if (activityId == "-1") {
        activities = await Activity.find({ owner: userName });
    } else {
        activities = await Activity.find({ owner: userName, _id: activityId });
    }
    console.log("return #" + activities.length + " activities");
    res.send(activities);
});
//gestione richiesta post per l'aggiunta di un'attività
app.post("/addActivity", async (req, res) => {
    console.log("/addActivity " + req.body);
    const { userName, title, end, participants, is_completed } = req.body;
    const NewActivity = new Activity({
        owner: userName,
        title: title,
        end: end,
        has_deadline: (end != null),
        participants: participants,
        is_completed: is_completed,
        creation_date: Date.now()
    });
    try {
        NewActivity.save();
        console.log("added activity=" + NewActivity);
        res.json({ message: "OK" });
    } catch (error) {
        console.error("Errore nella crazione dell'attività: ", error);
        res.status(500).send("Error saving new activity");
    }
});
//gestione richiesta post per la modifica di un'attività
app.post("/editActivity", async (req, res) => {
    console.log("/editActivity " + req.body);
    const { userName, activityId, title, end, participants, is_completed } = req.body;
    console.log("ricerca di activityId:" + activityId);
    var activity = await Activity.findOne({ _id: activityId, owner: userName });
    if (!activity) {
        res.json({
            message: "activity not found"
        });
    } else {
        activity.title = title;
        activity.end = end;
        activity.has_deadline = (end != null);
        activity.participants = participants;
        activity.is_completed = is_completed;
        try {
            activity.save();
            res.json({ message: "OK" });
            console.log("salvato:" + activity);
        } catch (error) {
            console.error("Errore nel salvataggio dell'attività: ", error);
            res.status(500).send("Error modifying activity");
        }
    }
});
app.post("/deleteActivity", async (req, res) => {
    console.log("/deleteActivity " + req.body);
    const { userName, activityId } = req.body;
    console.log("ricerca di activityId=" + req.body.activityId);
    try {
        var activity_ = await Activity.findOne({ _id: activityId, owner: userName });
        if (!activity_) {
            console.log("Attivita non trovata: " + activityId);
            res.json({
                message: "activity not found"
            });
        } else {
            r = await Activity.findByIdAndDelete(activityId);
            console.log("cancellato:" + activityId);
            //if(!r){
            //	return res.status(404).send("Activity not found");
            //}
            res.json({ message: "OK" });
        }
    } catch (error) {
        console.log("ERRORE: ", error);
        res.status(500).send("Error deleting activity");
    }
});

app.listen(3000, () => {
    console.log("app listening on port 3000");
});
