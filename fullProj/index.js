const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { type } = require("os");
const bodyParser = require("body-parser");
const { rmSync } = require("fs");
const { ConnectionClosedEvent } = require("mongodb");

app.use(cors());
app.set("view engine");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const mongoDBUri = "mongodb+srv://marcostignani9:qpalzmQP8@clusternote.yd03buh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNote";
//const mongoDBUri = "mongodb+srv://giarrussolorenzo:t1otEqlgBECuv4NL@cluster0.hqzaedi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

const noteSchema = new mongoose.Schema({
    user: String,
    public: Boolean,
    heading: String,
    content: String,
    date: { type: Date, default: Date.now() },
    place: String,
    tags: [String],
    todo_children: { type: [String], default: [] },//array dove salvare gli id dei to-do creati nel corpo della nota per eventuali modifiche
    el_type: { type: String, default: "notes" }
});

const todoSchema = new mongoose.Schema({
    parent_id: String,//id della nota da cui è stato creato il to-do
    user: String,
    public: Boolean,
    heading: String,
    tasks: [String],
    date: { type: Date, default: Date.now() },
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

const userSchema = new mongoose.Schema({/*!!!!!!!!!!!!!!!!!*/
    name: String,
    passw: String,
    friends: { type: [String], default: [] },
    inbox: { type: [String], default: [] }
});

const eventSchema = new mongoose.Schema({
    owner: String,
    participants: { type: [String], default: [] },
    participants_state: { type: [String], default: [] },          /* "waiting" per non ha ancora accettato, "refused" per ha rifiutato e "accepted" per ha accettato */
    title: String,
    date_start: Date,
    date_end: Date,
    repetitions: Number,                   /* 0 per infinite */
    interval_period: Number,
    interval_days_in_week: [Number],       /* giorni nella settimana */
    interval_n_day_in_month: [Number],     /* n esimo giorno del mese */
    interval_n_of_day_in_month: [Number],  /* n esimo giorno della settimana nel mese, codifica "n, giorno" */
    duration: Number,                      /* numero di minuti di durata */
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
const User = mongoose.model("User", userSchema);/*!!!!!!!!!!!*/
const Session = mongoose.model("Session", sessionSchema);
const Event = mongoose.model("Event", eventSchema);
const Activity = mongoose.model("Activity", activitySchema);

var currentUser = null;

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

//gestione richiesta post per richiedere un numero di note (con limit = -1 si ottengono tutte le note) 
app.post("/getNotes/:limit", async (req, res) => {
    var lim = Number(req.params.limit);
    var note;
    if (lim > 0) {
        note = await Note.find({ user: currentUser.name }).limit(lim);
    } else {
        note = await Note.find({ user: currentUser.name });
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
    const { ID, parent_id, heading, content, tags, place, public, post_type, todo_children } = req.body;
    var savedDocument;

    //la tipologia del post viene riconosciuta con il valore di post_type (0 per le note e 1 per i to-do)
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

            } catch (error) {
                console.log("Error fetching note to modify: ", error);
            }
        } else {
            var newNote = new Note({
                user: currentUser.name,
                public: public,
                heading: heading,
                content: content,
                place: place,
                tags: tags.split(',').map(tag => tag.trim())
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
                user: currentUser.name,
                public: public,
                heading: heading,
                tasks: content.split("\n").map(task => task.trim()).filter(item => item !== ""),
                completed: Array(content.split("\n").length).fill(false),
                place: place,
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
                savedDocument = await newNote.save();
            }
            //se la richiesta era per la creazione di una nuova nota allora nella risposta dal server viene aggiunto l'ID della nota appena creata 
            //servirà durante la creazione dei to-do (se presenti)
            if (todo_children && !savedDocument.todo_children.length) {
                res.json({
                    message: "Add todo children",
                    id: savedDocument._id
                });
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
        const { _id, ...data } = req.body;
        const newSession = new Session({
            user: currentUser.name,
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
    const { user } = req.body;
    try {
        var userSessions = await Session.find({ user: user }).sort({ dateTime: "descending" });
        const now = new Date().getTime();

        //Check each session from the most recent to the oldest. If the currently checked session was the latest session before "now", send its info.
        //Necessary in order to account for time machine (otherwise it would have just sent userSession[0]).
        //When time machine is implemented, TODO: change initialization of "now" constant above
        for (const session of userSessions) {
            if (session.dateTime < now) {
                res.json(session);
            }
        }

        //Either no previous session exists, or none of them are before the time considered as "now"
        res.json(undefined);

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

//gestione richiesta post per il login/register di un utente
//la tipologia della registrazione viene passata nell'URL della richiesta
//alla fine della gestione della richiesta se non ci sono stati errori l'utente viene salvato nella variabile currentUser utilizzata per le operazioni e i display dei post
app.post("/user/:regType", async (req, res) => {
    var newUser = null;
    var user = null;
    var x = null;
    //oggetto utilizzato per una più facile ricerca nel database
    const loggedUser = {
        name: req.body.username,
        passw: req.body.password
    };

    if (req.params.regType == "Login") {
        try {
            user = await User.findOne(loggedUser);
            if (!user) {
                res.json({
                    message: "user not found while login"
                });
            } else {
                currentUser = user;
                res.json({ message: "OK" });
            }
        } catch (error) {
            res.status(500).send("Error login");
        }
    } else {
        x = await User.findOne(loggedUser);
        //se viene effettuata una registrazione di un nuovo utente ma è già presente un utente con quel nome nel database la richiesta non viene effettuata
        if (x) {
            res.json({
                message: "username found while register"
            });
        } else {
            var newUser = new User({
                name: req.body.username,
                passw: req.body.password
            });
            try {
                newUser.save();
                currentUser = newUser;
                res.json({ message: "OK" });
            } catch (error) {
                res.status(500).send("Error saving new user");
            }
        }
    }
});

app.get("/user/checkLogged", (req, res) => {
    res.json({ message: currentUser != null ? "true" : "false" });
});

app.get("/user/logout", (req, res) => {
    currentUser = null;
    res.json({ message: "OK" });
});

//---------------------------------------------------------------
//funzioni per la gestione della ricerca 
//!!!NOTA!!! --> NON TESTATE
async function realSearch(u, filter, query) {
    let results = [];
    if (filter == "tag") {
        const allNote = await Note.find({ user: u, public: true });
        //aggiungere todo
        allNote.forEach(item => {
            if (item.tags.includes(query)) {
                results.push(item);
            }
        });
    } else {
        const resultsNote = await Note.find({
            user: u,
            public: true,
            [filter]: { $regex: new RegExp(query, 'i') }
        });
        //aggiungere todo
        results = resultsNote;
    }
    return results;
}

async function asyncFunc(user, filter, query) {
    const results = await realSearch(user, filter, query);
    return results;
}

async function processUsers(users, filter, query) {
    const promises = users.map(user => asyncFunc(user, filter, query));
    const results = await Promise.all(promises);
    return results.flat();
}

app.post('/search', async (req, res) => {
    if (!req.query.query) {
        res.status(400).send("Query parameter is required");
    }
    try {
        const query = req.query.query;
        const filter = req.query.filter;
        const friends = req.query.friends;

        var users;
        if (friends == "true") {
            users = currentUser.friends;
        } else {
            users = [currentUser.name];
        }

        const searchResults = await processUsers(users, filter, query);

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
    console.log("return=" + events);
    res.send(events);
});
//gestione richiesta post per l'aggiunta di un'evento
app.post("/addEvent", async (req, res) => {
    console.log("/addEvent " + req.body);
    const { userName, title, date_start, date_end, place, participants, all_day } = req.body;
    const NewEvent = new Event({
        owner: userName,
        title: title,
        date_start: date_start,
        date_end: date_end,
        place: place,
        participants: participants,
        all_day: all_day
    });
    try {
        NewEvent.save();
        console.log("added event=" + NewEvent);
        res.json({ message: "OK" });
    } catch (error) {
        res.status(500).send("Error saving new activity");
    }
});
//gestione richiesta post per la modifica di un'evento
app.post("/editEvent", async (req, res) => {
    console.log("/editEvent " + req.body);
    const { userName, eventId, title, date_start, date_end, place, participants, all_day } = req.body;
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
        try {
            event_.save();
            res.json({ message: "OK" });
            console.log("salvato:" + event_);
        } catch (error) {
            res.status(500).send("Error modifying event");
        }
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
    console.log("return=" + activities);
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
        participants: participants,
        is_completed: is_completed,
        creation_date: Date.now()
    });
    try {
        NewActivity.save();
        console.log("added activity=" + NewActivity);
        res.json({ message: "OK" });
    } catch (error) {
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
        activity.participants = participants;
        activity.is_completed = is_completed;
        try {
            activity.save();
            res.json({ message: "OK" });
            console.log("salvato:" + activity);
        } catch (error) {
            res.status(500).send("Error modifying activity");
        }
    }
});

app.listen(3000, () => {
    console.log("app listening on port 3000");
});