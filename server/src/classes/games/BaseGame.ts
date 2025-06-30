// abstract class
import { Server, Socket } from "socket.io";
import { Student } from "../users/Student";
import { Instructor } from "../users/Instructor";
import { SocketManager } from "../../socket/SocketManager";
import { BreakoutRoomData } from "../../types/types";
import { GameConfigs } from "../../types/types";

/**
 *
 * This abstract class contains very basic implementations of certain methods that will be overrided
 * during the implementation of the more specific sublcass games.
 *
 */

export abstract class BaseGame {
  //////////////////////////////////////////////////////////////
  // instance variables
  //////////////////////////////////////////////////////////////
  public players: Map<string, Student | Instructor> = new Map(); // userId : user-type
  public socketManager?: SocketManager;
  public playerCount: number = 0;
  public roomId: string;
  public hostId: string;
  public gameConfigs: GameConfigs;

  /**
   * using array for now to take advantage of socket.rooms api.
   * may change later for more flexibility
   * the array will just hold all the different room ids
   */
  public breakoutRoomIds: string[] = [];
  public breakoutRoomCount: number = 0;
  public roomMap: Map<string, BreakoutRoomData> = new Map();

  //////////////////////////////////////////////////////////////
  // constructor
  //////////////////////////////////////////////////////////////
  constructor(
    roomId: string,
    protected io: Server,
    hostId: string,
    gameConfigs: object
  ) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.gameConfigs = gameConfigs;
  }

  // Set the socket manager reference
  setSocketManager(socketManager: SocketManager): void {
    this.socketManager = socketManager;
  }
  //////////////////////////////////////////////////////////////
  // basic abstract methods for every game
  //////////////////////////////////////////////////////////////
  abstract onPlayerMove(socket: Socket, action: string): void;
  abstract sendOpponentMove(socket: Socket): void;

  //////////////////////////////////////////////////////////////
  // concrete methods
  //////////////////////////////////////////////////////////////
  // very basic implementation for now, the more specific sublcass games will override this
  onPlayerJoin(
    socket: Socket,
    userId: string,
    username: string,
    host: boolean
  ): void {
    const player = host
      ? new Instructor(socket, userId, username)
      : new Student(socket, userId, username);

    this.players.set(userId, player);
    socket.join(this.roomId);
    this.playerCount++;
    this.io
      .to(this.roomId)
      .emit("player:connect", `Player "${username}" has connected`);
  }

  onPlayerDisconnect(socket: Socket, userId: string): void {
    socket.leave(this.roomId);
    socket.roomId = "";

    // We don't delete the player from the map to allow for reconnection
    // Instead, mark the player as disconnected
    const player = this.players.get(userId);
    if (player) {
      player.setDisconnected(true);
      const username = player.getNickname();

      // Emit disconnect event
      this.io
        .to(this.roomId)
        .emit("player:disconnect", `Player "${username}" has disconnected`);

      // Also emit updated player list
      this.io.to(this.roomId).emit("server:listUsers", this.getPlayers());

      // If the player was ready, update their ready status
      if (player.isReady()) {
        player.setReady(false);
        this.io.to(this.roomId).emit("player:readyUpdate", {
          playerId: userId,
          playerName: username,
          isReady: false,
        });
      }
    }
  }

  onPlayerReconnect(socket: Socket, userId: string, username: string): void {
    const player = this.players.get(userId);

    if (player) {
      // Update the player's socket and connection status
      player.updateSocket(socket);
      player.setDisconnected(false);

      // Join the socket to the room
      socket.join(this.roomId);

      this.io
        .to(this.roomId)
        .emit("player:reconnect", `Player "${username}" has reconnected`);
    } else {
      // If player wasn't found, treat as a new join (non-host)
      this.onPlayerJoin(socket, userId, username, false);
    }
  }

  // TODO: fix this so it gets the users that are in breakout rooms
  getPlayers(): string[] {
    const res: string[] = [];
    for (const [userId, player] of this.players) {
      // Only add non-disconnected players to the result
      if (!player.isDisconnected()) {
        res.push(player.getNickname());
      }
    }
    return res;
  }

  getStudentPlayers(): string[] {
    const res: string[] = [];
    for (const [userId, player] of this.players) {
      // Only add non-disconnected players that are not the host
      if (!player.isDisconnected() && userId !== this.hostId) {
        res.push(player.getNickname());
      }
    }
    return res;
  }

  areAllStudentsReady(): boolean {
    // First, count how many students we have and how many are ready
    let studentCount = 0;
    let readyCount = 0;

    for (const [userId, player] of this.players) {
      // Skip the host and disconnected players
      if (userId === this.hostId || player.isDisconnected()) {
        continue;
      }

      studentCount++;
      if (player.isReady()) {
        readyCount++;
      }
    }

    // Log the counts for debugging
    console.log(`Student count: ${studentCount}, Ready count: ${readyCount}`);

    // If there are no students, return false
    if (studentCount === 0) {
      return false;
    }

    // Return true if all students are ready
    return readyCount === studentCount;
  }

  getStudentCount(): number {
    let count = 0;
    for (const [userId, player] of this.players) {
      if (userId !== this.hostId && !player.isDisconnected()) {
        count++;
      }
    }
    return count;
  }

  checkRole(socket: Socket): string {
    return "";
  }

  // temp function to list all the rooms and players
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

  modifyGameSetting(
    socket: Socket,
    settingName: string,
    value: number | string | any[]
  ) {
    this.gameConfigs[settingName] = value;
  }

  async countSocketsInRoom(roomId: string): Promise<number> {
    const sockets = await this.io.in(roomId).fetchSockets();
    return sockets.length;
  }

  onGameStart(): void {
    console.log(`Game with room id "${this.roomId}" has started`);
  }

  sendGameInfoToStudent(socket: Socket): void {}

  // test methods
  sendMoveToOpponent(socket: Socket): void {}
  setPlayerMove(socket: Socket, action: string): void {}
  getOpponentMove(socket: Socket): string | undefined {
    return;
  }
  sendMoves(socket: Socket): void {}

  confirmPlayerMove(socket: Socket): void {}
  unconfirmPlayerMove(socket: Socket): void {}
  checkIfAllStudentsReady(roomId: string): boolean {
    return false;
  }
  getRoomQuantitiesAsArray(roomId: string): number[] {
    return [];
  }
  getTotalRoomQuantity(roomId: string): number {
    return 0;
  }

  ////////////////////////////////////////////////////////////
  // timer methods
  ////////////////////////////////////////////////////////////

  startRoundTimer(breakoutRoomId: string, durationMinutes: number): void {
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${breakoutRoomId}`);
      return;
    }

    // clear existing timer
    if (roomData.timerInterval) {
      clearInterval(roomData.timerInterval);
    }

    const endTime = Date.now() + durationMinutes * 60 * 1000;
    roomData.timerEndTime = endTime;
    roomData.timerActive = true;

    // inital broadcast of timer
    this.broadcastTimerUpdate(breakoutRoomId);

    const interval = setInterval(() => {
      const remainingTime = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );

      console.log(`Remaining time: ${remainingTime}`);

      this.broadcastTimerUpdate(breakoutRoomId);

      if (remainingTime <= 0) {
        this.endRoundTimer(breakoutRoomId);
      }
    }, 1000);

    roomData.timerInterval = interval;
  }

  // emit timer update to the breakout room
  broadcastTimerUpdate(breakoutRoomId: string): void {
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${breakoutRoomId}`);
      return;
    }

    const remainingTime = Math.max(
      0,
      Math.floor((roomData.timerEndTime - Date.now()) / 1000)
    );

    // broadcast timer update to all students in the breakout room
    this.io.to(breakoutRoomId).emit("server:timerUpdate", {
      remainingTime,
      active: roomData.timerActive,
    });
  }

  endRoundTimer(breakoutRoomId: string): void {
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${breakoutRoomId}`);
      return;
    }

    // clear interval
    if (roomData.timerInterval) {
      clearInterval(roomData.timerInterval);
      roomData.timerInterval = undefined;
    }

    roomData.timerActive = false;

    // broadcast final timer update
    this.broadcastTimerUpdate(breakoutRoomId);

    // handle end of round
    this.handleRoundEnd(breakoutRoomId);
  }

  handleRoundEnd(breakoutRoomId: string): void {
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${breakoutRoomId}`);
      return;
    }

    this.saveRoundData(breakoutRoomId);

    roomData.roundNo++;

    for (const user of roomData.userReadyMap.keys()) {
      roomData.userReadyMap.set(user, false);
    }

    roomData.userMoves.clear();

    // notify students
    this.io.to(breakoutRoomId).emit("server:roundEnd", {
      roundNo: roomData.roundNo - 1,
      nextRoundNo: roomData.roundNo,
      roundHistory: roomData.roundHistory,
    });
  }

  saveRoundData(breakoutRoomId: string): void {
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${breakoutRoomId}`);
      return;
    }

    // create a new map for the round if it DNE
    if (!roomData.roundHistory.has(roomData.roundNo)) {
      roomData.roundHistory.set(roomData.roundNo, new Map());
    }

    for (const [user, move] of roomData.userMoves.entries()) {
      const roundData = roomData.roundHistory.get(roomData.roundNo);
      if (roundData) {
        if (
          move !== undefined &&
          (typeof move === "number" || typeof move === "string")
        ) {
          // push all required quantities into this array to be sent back to the student at the end of the round
          let userEndRoundData: Map<string, number | string> = new Map();
          userEndRoundData.set("move", move);
          roundData.set(user, userEndRoundData);
        }
      }
    }
  }
}
