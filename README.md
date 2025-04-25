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