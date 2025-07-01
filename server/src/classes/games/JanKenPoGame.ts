import { BaseGame } from "./BaseGame";
import { Server, Socket } from "socket.io";
import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";
import { BreakoutRoomData } from "../../types/types";
import { GameConfigs, JankenPoGameConfigs } from "../../types/types";

export class JanKenPoGame extends BaseGame {
  public gameConfigs: JankenPoGameConfigs;

  private winningMovesMap = {
    rock: "scissors",
    scissors: "paper",
    paper: "rock",
  };

  constructor(
    roomId: string,
    io: Server,
    hostId: string,
    gameConfigs: GameConfigs
  ) {
    super(roomId, io, hostId, gameConfigs);
    const config = gameConfigs as JankenPoGameConfigs;
    if (!config.maxPlayersPerRoom || !config.roundLength || !config.maxRounds) {
      throw new Error("Invalid game configs");
    }
    this.gameConfigs = config;
  }

  // two cases: host and non-host - host is in the main room, non-host is in the breakout room
  async onPlayerJoin(
    socket: Socket,
    userId: string,
    username: string,
    host: boolean
  ): Promise<void> {
    if (host) {
      socket.join(this.roomId);
      const player = new Instructor(socket, userId, username, this.roomId);
      this.players.set(userId, player);
      this.playerCount++;
      console.log(
        `Instructor ${username} (${userId}) joined main room ${this.roomId}`
      );
    } else {
      let tempRoomId = this.roomId + "_" + this.breakoutRoomCount; // "JWKDKE_0"
      if (
        (await this.countSocketsInRoom(tempRoomId)) >=
        this.gameConfigs.maxPlayersPerRoom
      ) {
        this.breakoutRoomCount++;
        tempRoomId = this.roomId + "_" + this.breakoutRoomCount; // update BR id
        socket.join(tempRoomId);
        console.log(
          `Player ${username} (${userId}) joined breakout room ${tempRoomId}`
        );
      } else {
        socket.join(tempRoomId);
        console.log(`Player ${username} (${userId}) joined room ${tempRoomId}`);
      }

      const player = new Student(socket, userId, username, tempRoomId);

      // set the room map
      if (!this.roomMap.has(tempRoomId)) {
        this.roomMap.set(tempRoomId, {
          users: [player],
          userMoves: new Map(),
          userReadyMap: new Map(),
          roundNo: 0,
          roundHistory: new Map(),
          roomHistory: new Map(),
          timerActive: false,
          timerEndTime: 0,
          timerInterval: undefined,
        });
      } else {
        this.roomMap.get(tempRoomId)?.users.push(player);
      }

      // set the players map
      this.players.set(userId, player);
      this.playerCount++;

      // set the breakout room ids
      this.breakoutRoomIds.push(tempRoomId);

      socket.roomId = tempRoomId;
      this.io
        .to(tempRoomId)
        .emit("player:connect", `Player "${username}" has connected`);
    }

    console.log(this.roomMap);
    console.log(socket.roomId);
  }

  listRoomsAndPlayers(): object {
    const res: Map<string, string[]> = new Map();

    for (const currRoomId of this.breakoutRoomIds) {
      const temp: string[] = [];
      const roomData: BreakoutRoomData | undefined =
        this.roomMap.get(currRoomId);
      if (roomData) {
        for (const user of roomData.users) {
          temp.push(user.getNickname());
        }
      }
      res.set(currRoomId, temp);
    }
    const objectData = Object.fromEntries(res);
    return objectData;
  }

  // for some reason the socket room id isnt the breakout room id but the main room id
  onPlayerMove(socket: Socket, action: string): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player not found");
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructor cannot move");
      return;
    }
    player.setUserMove(action);
    console.log(`Player ${player.getNickname()} moved with action: ${action}`);

    console.log("///////////////////////////////////////");
    console.log(socket.roomId);
    console.log("///////////////////////////////////////");

    // temp fix for now is to search the user via the maps
    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error("Breakout room id not found");
      return;
    }

    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error("Room data not found");
      return;
    }
    roomData.userMoves.set(player, action);

    const opponent = roomData.users.find(
      (user) => user.userId !== socket.userId
    );
    if (!opponent) {
      console.error("Opponent not found");
      return;
    }

    const opponentMove = roomData.userMoves.get(opponent);
    if (!opponentMove) {
      console.error("Opponent move not found");
      return;
    }

    if (this.winningMovesMap[action] === opponentMove) {
      console.log(`Player ${player.getNickname()} won the game`);
    } else if (this.winningMovesMap[opponentMove] === action) {
      console.log(`Player ${player.getNickname()} lost the game`);
    } else {
      console.log(`Player ${player.getNickname()} tied the game`);
    }
  }

  // go through the breakout room, find the opponent, check for move, send the move to the socket
  sendOpponentMove(socket: Socket): void {
    console.log("sendOpponentMove method hit");
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player not found");
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructor cannot move and should not recieve a move");
      return;
    }

    // const mainRoomId = socket.roomId;
    const roomId = (player as Student).getBreakoutRoomId();
    if (!roomId) {
      console.error("Room id not found");
      return;
    }

    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error("Room data not found");
      return;
    }

    const roomUsers = roomData.users;
    const opponent = roomUsers.find((user) => user.userId !== socket.userId);
    const opponentMove = opponent?.getUserMove();
    if (!opponentMove) {
      console.error("Opponent move not found");
      return;
    }
    socket.emit("game:checkMove", { action: opponentMove });
  }

  // test method - should send the current users move to the opponent
  sendMoveToOpponent(socket: Socket): void {
    console.log("sendMoveToOpponent method hit");
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player DNE");
      return;
    }

    if (player instanceof Instructor) {
      console.error("player is of type instructor and can not move");
      return;
    }

    const roomId = (player as Student).getBreakoutRoomId();
    if (!roomId) {
      console.error("Room id not found");
      return;
    }

    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error(`Room data not found for room id: ${roomId}`);
      return;
    }

    const roomUsers = roomData.users;
    const opponent = roomUsers.find((user) => user.userId !== socket.userId);
    const opponentSocket = opponent?.getSocket();
    if (!opponentSocket) {
      console.error("Opponent socket not found");
      return;
    }
    const currentUserMove = player.getUserMove();
    opponentSocket.emit("game:checkMove", { action: currentUserMove });
  }

  // change this to make moves less complicated
  // one method to set a player move
  // one method to check if there are opponent moves

  setPlayerMove(socket: Socket, action: string): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player DNE");
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructor cannot move");
      return;
    }

    const roomId = (player as Student).getBreakoutRoomId();
    if (!roomId) {
      console.error("Room id not found");
      return;
    }
    this.roomMap.get(roomId)?.userMoves.set(player, action);
    console.log(
      `Player "${player.getNickname()}" moved with action: ${action}`
    );
  }

  // if undefined then the opponent has not moved yet, the user is then user1 (first player to make a move)
  // if defined, then the opponent has moved and follow user2 plan
  getOpponentMove(socket: Socket): string | undefined {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player DNE");
      return;
    }
    const roomUsers = this.roomMap.get(
      (player as Student).getBreakoutRoomId()
    )?.users;
    if (!roomUsers) {
      console.error("Room users not found");
      return;
    }
    const opponent = roomUsers.find((user) => user.userId !== socket.userId);
    if (!opponent) {
      console.error("Opponent not found");
      return;
    }
    const opponentMove = this.roomMap
      .get((player as Student).getBreakoutRoomId())
      ?.userMoves.get(opponent);
    console.log(
      `Returning opponent "${opponent.getNickname()}" move: ${opponentMove}`
    );
    return opponentMove as string;
  }

  sendMoves(socket: Socket): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player DNE");
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructor cannot move");
      return;
    }
    const roomUsers = this.roomMap.get(
      (player as Student).getBreakoutRoomId()
    )?.users;
    if (!roomUsers) {
      console.error("Room users not found");
      return;
    }
    const opponent = roomUsers.find((user) => user.userId !== socket.userId);
    if (!opponent) {
      console.error("Opponent not found");
      return;
    }
    const opponentSocket = opponent.getSocket();
    const playerMove = this.roomMap
      .get((player as Student).getBreakoutRoomId())
      ?.userMoves.get(player);
    const opponentMove = this.roomMap
      .get((player as Student).getBreakoutRoomId())
      ?.userMoves.get(opponent);
    if (!playerMove || !opponentMove) {
      console.error("Move not found");
      return;
    }
    try {
      opponentSocket.emit("game:checkMove", { action: playerMove });
      socket.emit("game:checkMove", { action: opponentMove });
      console.log("Move sent");
    } catch (error) {
      console.error("Error sending moves");
    }

    console.log("///////////////////////////////////////");
    if (playerMove === opponentMove) {
      console.log(
        `Draw: Player ${player.getNickname()} and ${opponent.getNickname()} tied with the move: ${playerMove}`
      );
    } else if (this.winningMovesMap[playerMove] === opponentMove) {
      console.log(`Player ${player.getNickname()} won the game`);
    } else {
      console.log(`Player ${opponent.getNickname()} won the game`);
    }
    console.log("///////////////////////////////////////");
  }
}
