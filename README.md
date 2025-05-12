**Autori**

Andrea Zanella andrea.zanella7@studio.unibo.it

Fabio Poli fabio.poli4@studio.unibo.it

Lorenzo Giarrusso lorenzo.giarrusso@studio.unibo.it

--------------------------

**Contributo individuale**

*Andrea Zanella*: note (creazione, visualizzazione, modifica, ecc.), pagina utente, autenticazione, messaggi, amicizie, condivisione tra utenti, deploy

*Fabio Poli*: visualizzazione e gestione del calendario, creazione e gestione eventi (anche condivisi e/o ricorrenti), creazione e gestione attività (anche condivise), gestione delle notifiche che provengono dal calendario, creazione e gestione di eventi "non disponibile", integrazione con lo standard iCalendar, interazione di eventi e attività con la time machine

*Lorenzo Giarrusso*: schermata Home (contenuti, personalizzazione delle preview ed ottenimento delle informazioni relative ad esse, grafica), implementazione del Pomodoro, integrazione del Pomodoro con eventi e calendario, condivisione e gestione di eventi Pomodoro, gestione ed integrazione delle sessioni Pomodoro, implementazione della Time Machine, interfaccia grafica di varie schermate del sito (home, form di login, form di creazione eventi, rifinitura della pagina utente, pagina di elenco delle note, pagina di dettaglio per note individuali, Pomodoro, ecc.)


--------------------------

**Scelte implementative**

Il progetto è stato realizzato utilizzando Vue come framework di sviluppo. Le librerie selezionate per la gestione delle parti principali del progetto sono state: dotenv per parametri di configurazione globale; Axios per le richieste HTTP asincrone; Mongoose per l'interazione con MongoDB; Vue Router per il routing; Bootstrap per costruire l'interfaccia grafica; Passport e JWT per l'autenticazione; dayjs per la gestione di date e tempi; Pinia per la gestione degli stati; NodeMailer per l'implementazione delle e-mail di notifica; FullCalendar, ics e ical per la gestione del calendario; Marked per l'implementazione del Markdown nelle note.

--------------------------

**Utilizzo dell'IA generativa**

L'IA generativa è stata utilizzato come copilota in fase di rifinitura di alcune interfacce grafiche per la generazione di uno scheletro essenziale, poi modificato, integrato ed adattato a quanto già esistente. 

--------------------------
--------------------------

**Installation**

1. In /fullProj/,

```
npm install
```
2a. In /fullProj/,

```
npx nodemon index.js
```

2b. In /fullProj/, 

```
npm run serve
```

The app will be available on localhost:8080

--------------------------

**Project Structure**

The project is organized as follows:

```
README.md                   # Documentation for the project
.gitignore                  # Git ignore rules

/fullProj/
├── /dist/                  # Compiled and minified files for production
├── /node_modules/          # Installed dependencies (auto-generated)
├── /public/                # Public assets
├── /src/                   # Source code for the application
│   ├── /assets/            # Static assets like images, styles, and fonts
│   ├── /components/        # Reusable UI components 
│   ├── /stores/            # State management using Pinia
│   ├── App.vue             # Root Vue component
│   ├── main.js             # Application entry point
│   └── routes.js           # Vue Router configuration
├── .env                    # Environment variables for configuration
├── activityUtils.js        # Utility functions for managing activities
├── babel.config.js         # Babel configuration for transpiling JS
├── eventUtils.js           # Utility functions for managing events
├── index.js                # Main entry point of the backend server
├── jsconfig.json           # Configuration for JavaScript tooling
├── messageModel.js         # Mongoose schema for user messages
├── notificationUtils.js    # Utility functions for handling notifications
├── package-lock.json       # Lockfile for npm dependencies
├── package.json            # Project metadata and dependencies
├── passport-config.js      # Passport.js configuration for authentication
├── userModel.js            # Mongoose schema for user data
└── vue.config.js           # Vue CLI configuration
```

Each file and directory has a specific purpose:

- **/dist/**: Contains the files generated for production deployment.
- **/node_modules/**: Auto-generated directory containing dependencies installed via npm.
- **/public/**: Includes static files like `index.html` and other public resources.
- **/src/**: Contains the application's source code, organized into components, assets, and configurations.
- **index.js**: Entry point for the backend server, managing APIs and server-side logic.
- **activityUtils.js** and **eventUtils.js**: Support functions for managing activities and events.
- **notificationUtils.js**: Handles notifications for events and activities.
- **userModel.js** and **messageModel.js**: Mongoose schemas for managing user and message data.
- **vue.config.js**: Configuration for the Vue.js project.
