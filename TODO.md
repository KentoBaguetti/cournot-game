## My todo list so i remember where i left off

- create user mappings on the server side to map users to their respective game room DONE
- keep adding maps -- users, gameRooms, activeGames, type shii DONE maybe too many maps, its too complicated now
- migrate away from using socket.id's to using the jwt tokens -- should probably move them to cookies ehh kinda done?
- handle reconnections semi done
- switch room creation flow to be create game --> get join code --> view join code --> instructor has choice to go to other pages such as dashboards

## breakout room flow

students should be placed into breakout rooms as soon as they join the game, this means a lot of the socket manipulations should happen from within the game classes, not in auth or server

2 ways:

- create a new game for each breakout room (no good i think)
- in the game, create new rooms with the names (roomId + some identifier like a count variable that increments for every room) that way the host has control over every room

- refactoring shii (can be later)
- move express routes into its own file
- socket.io endpoint bodies should be moved into a separate file as well

- How to handle maintenence?

### What tools are being used:

- socket.io
- express
- jwt
- axios
- react
- uuied
