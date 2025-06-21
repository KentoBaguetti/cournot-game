# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Different pages and their uses:

- `Home.tsx` | The root page where all users start off at, they can select if they are a user or instructor

#### Instructor

- `InstructorLogin.tsx` | Allow a user to login as an instructor
- `InstructorDashboard.tsx` | Display info such as what games the instructor can make (probably should rename this later)
- `Create{gameName}GamePage.tsx` | Page for the instructor to configure settings for their game (will switch this to use navigation schema when scaling up)
- `GameDashboard.tsx` | Page for displaying game info to the instructor
- `DisplayGameInfoPage.tsx` | Page for displayiing game information that the instructor is happy to share (via screen share or whatever, very simple page eg join code and users in the game) (this might make things a bit complicated as data wont be persistant between the two pages)

#### Student

- `StudentJoin.tsx` | Page for students to join a game via a joincode and to set their username
- `GameLobby.tsx` | Intermediary page for the users. Main purpose is to set up the websocket connection, displays info such as the host, joincode, and other users
- `{game}Page.tsx` | Game page for the students to play the game
