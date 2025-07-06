import { Instructor } from "../users/Instructor";
import { Student } from "../users/Student";
import { BaseGame } from "./BaseGame";
import { Socket, Server } from "socket.io";
import { GameConfigs, CournotGameConfigs } from "../../types/types";
import {
  calculateMarketPrice,
  maxProfitFunction,
  profitFunction,
  calculateQuantitySum,
  priceFunction,
  costFunction,
  calculateMaxMonopolyQuantity,
  countNumberOfFirms,
} from "../../utils/cournotFormulas";

export class CournotGame extends BaseGame {
  // Cournot constructor to specifically handle the different game configs
  constructor(
    roomId: string,
    protected io: Server,
    hostId: string,
    gameConfigs: GameConfigs
  ) {
    super(roomId, io, hostId, gameConfigs);
    const config = gameConfigs as CournotGameConfigs;
    if (config.y === undefined) {
      config.y = 0;
    }
    if (
      !config.maxPlayersPerRoom ||
      !config.roundLength ||
      !config.maxRounds ||
      config.x === undefined ||
      config.y === undefined ||
      config.z === undefined
    ) {
      throw new Error("Invalid game configs");
    }
    this.gameConfigs = config;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // override the onPlayerJoin method specifically for the CournotGame
  // TODO: figure out how to make this method synchronous
  ///////////////////////////////////////////////////////////////////////////////
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

      // this is the main room id, but should check in case this is redundant
      socket.roomId = this.roomId;
    } else {
      let tempRoomId = this.roomId + "_" + this.breakoutRoomCount;
      if (
        (await this.countSocketsInRoom(tempRoomId)) >=
        (this.gameConfigs as CournotGameConfigs).maxPlayersPerRoom
      ) {
        this.breakoutRoomCount++;
        tempRoomId = this.roomId + "_" + this.breakoutRoomCount;
        socket.join(tempRoomId);
      } else {
        socket.join(tempRoomId);
      }
      const player = new Student(socket, userId, username, tempRoomId);

      // set the room map
      if (!this.roomMap.has(tempRoomId)) {
        this.roomMap.set(tempRoomId, {
          users: [player],
          userMoves: new Map(),
          userReadyMap: new Map(),
          roundNo: 1,
          roundHistory: new Map(),
          roomHistory: new Map(),
          timerActive: false,
          timerEndTime: 0,
          timerInterval: undefined,
        });
      } else {
        // set the room map
        this.roomMap.get(tempRoomId)?.users.push(player);
        this.roomMap.get(tempRoomId)?.userReadyMap.set(player, false);
      }

      // set the player map
      this.players.set(userId, player);
      this.playerCount++;

      // set the breakout room ids
      this.breakoutRoomIds.push(tempRoomId);

      socket.roomId = tempRoomId;
    }
  }

  onGameStart(): void {
    for (const breakoutRoomId of this.breakoutRoomIds) {
      const roomData = this.roomMap.get(breakoutRoomId);
      if (!roomData) {
        console.error(`Room data not found for room: ${breakoutRoomId}`);
        continue;
      }

      const roundLength = (this.gameConfigs as CournotGameConfigs).roundLength;

      this.startRoundTimer(breakoutRoomId, roundLength, true);

      this.io.to(breakoutRoomId).emit("server:roundStart", {
        roundNo: roomData.roundNo,
        roundLength,
      });
    }
  }

  // send the xyz values to the student so they can do calculations on the frontend
  sendGameInfoToStudent(socket: Socket): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error("Player not found: sendGameInfoToStudent()");
      return;
    }
    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error("Breakout room not found: sendGameInfoToStudent()");
      return;
    }
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error("Room data not found: sendGameInfoToStudent()");
      return;
    }

    const numberOfFirms = roomData.users.length;
    const totalProductionQuantity = this.calculateMonopolyQuantity();
    const x = (this.gameConfigs as CournotGameConfigs).x;
    const y = (this.gameConfigs as CournotGameConfigs).y;
    const z = (this.gameConfigs as CournotGameConfigs).z;
    socket.emit("server:cournotInfo", {
      x,
      y,
      z,
      totalProductionQuantity,
      numberOfFirms: countNumberOfFirms(roomData),
    });

    // console.log(`sending game data: ${x}, ${y}, ${z}`);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // confirm a player's move
  ///////////////////////////////////////////////////////////////////////////////
  confirmPlayerMove(socket: Socket): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error(
        `Player not found for the user id: ${socket.userId}: confirmPlayerMove()`
      );
      return;
    }
    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error(`Breakout room not found for room: ${breakoutRoomId}`);
      return;
    }
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${breakoutRoomId}`);
      return;
    }
    roomData.userReadyMap.set(player as Student, true);
  }

  ///////////////////////////////////////////////////////////////////////////////
  // set the player's move
  ///////////////////////////////////////////////////////////////////////////////
  setPlayerMove(socket: Socket, action: string | number): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error(`Player with user id "${socket.userId}" not found`);
      return;
    }
    if (player instanceof Instructor) {
      console.error("Instructors can not move");
      return;
    }
    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error(`Breakout room not found for room ${breakoutRoomId}`);
      return;
    }
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for room ${breakoutRoomId}`);
      return;
    }
    if (player instanceof Student) {
      console.log(`Setting player move: ${action} and type: ${typeof action}`);
      roomData.userMoves.set(player as Student, Number(action));
      // TODO: userMoves is not being set correctly
      // console.log(
      //   "Room Data userMoves:",
      //   Array.from(roomData.userMoves.entries()).map(([student, move]) => ({
      //     studentId: student.userId,
      //     nickname: student.getNickname(),
      //     move,
      //   }))
      // );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////
  // send calculate cournot data back to the user
  // the "action" that the user made is the "Quantity" they are producing
  // NOTE: send cournot data immediately from this method, that way I dont need to handle ts in the server
  // NOTE: Make another method to send data to the instructor as this one is only for students
  ///////////////////////////////////////////////////////////////////////////////
  sendCournotData(socket: Socket): void {
    const player = this.players.get(socket.userId);
    if (!player) {
      console.error(
        `Player not found for the user id: ${socket.userId}: sendCournotData()`
      );
      return;
    }

    if (player instanceof Instructor) {
      console.error(
        "Instructor class should not be able to use this method: 'sendCournotData()'"
      );
      return;
    }

    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error(`Breakout room "${breakoutRoomId}" not found`);
      return;
    }

    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not set for breakout room: ${breakoutRoomId}`);
      return;
    }

    const userMoves = roomData.userMoves;
    if (!userMoves) {
      console.error(`User moves not set for breakout room: ${breakoutRoomId}`);
      return;
    }

    const userQuantity = userMoves.get(player);
    if (typeof userQuantity !== "number") {
      console.error(
        `User quantity not set for breakout room: ${breakoutRoomId} for player: ${player.getNickname()}`
      );
      return;
    }

    const userProfit = this.calculateProfitForFirm(player.userId);

    socket.emit("game:cournotData", {
      userProfit,
    });
  }

  ///////////////////////////////////////////////////////////////////////////////
  // send the opponent move to the socket instance
  ///////////////////////////////////////////////////////////////////////////////
  sendOpponentMove(socket: Socket): void {}

  ///////////////////////////////////////////////////////////////////////////////
  // return all the player moves in the breakout room to the socket instance
  ///////////////////////////////////////////////////////////////////////////////
  returnAllPlayerMoves(socket: Socket): void {
    const player = this.players.get(socket.userId);

    if (!player) {
      console.error("Player not found: returnAllPlayerMoves()");
      return;
    }

    /**
     *
     * Two cases: Instructor or Student
     *
     * Instructor:
     *  - return all moves from all breakout rooms
     *
     * Student:
     *  - return all moves from the breakout room the student is in
     *
     * Needs to be refined more , just a quick implementation for now
     * eg make data consistent for the frontend
     *
     */
    if (player instanceof Instructor) {
      socket.emit("server:allPlayerMoves", this.roomMap);
    } else {
      const breakoutRoomId = (player as Student).getBreakoutRoomId();
      if (!breakoutRoomId) {
        console.error("Breakout room not found");
        return;
      }
      const roomData = this.roomMap.get(breakoutRoomId);
      if (!roomData) {
        console.error(
          `Room data not found for breakout room: ${breakoutRoomId}`
        );
      }
      socket.emit("server:currentRoomMoves", roomData);
    }
  }

  /**
   * Check if all students in a given breakout room are ready. eg all players have made a move and confirmed
   */
  checkIfAllStudentsReady(roomId: string): boolean {
    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${roomId}`);
      return false;
    }
    for (const user of roomData.userReadyMap.keys()) {
      if (!roomData.userReadyMap.get(user)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Helper method - Get the quantities produced by all the firms in the room as an array
   * @param roomId - the room id to get the quantities for
   * @returns an array of quantities produced by all the firms in the room
   */
  getRoomQuantitiesAsArray(roomId: string): number[] {
    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${roomId}`);
      return [];
    }
    let allQuantites: number[] = [];
    for (const userQuantity of roomData.userMoves.values()) {
      if (typeof userQuantity === "number") {
        allQuantites.push(userQuantity);
      }
    }
    return allQuantites;
  }

  /**
   * Get the total quantity produced by all the firms
   * @param roomId - the room id to get the total quantity for
   * @returns the total quantity of all the firms in the room
   */
  getTotalRoomQuantity(roomId: string): number {
    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${roomId}`);
      return 0;
    }
    const allQuantities = this.getRoomQuantitiesAsArray(roomId);
    return calculateQuantitySum(allQuantities);
  }

  calculateProfitForFirm(userId: string): number {
    const player = this.players.get(userId);
    if (!player) {
      console.error("Player not found: calculateProfitForFirm()");
      return 0;
    }
    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error("Breakout room not found");
      return 0;
    }
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data not found for breakout room: ${breakoutRoomId}`);
      return 0;
    }
    const totalQuantity: number[] =
      this.getRoomQuantitiesAsArray(breakoutRoomId);

    const firmQuantity = roomData.userMoves.get(player as Student);
    if (typeof firmQuantity !== "number") {
      console.error("Firm quantity not found");
      console.log(
        `Firm quantity: ${firmQuantity} and type: ${typeof firmQuantity}`
      );
      return 0;
    }
    const profit: number = profitFunction(
      (this.gameConfigs as CournotGameConfigs).x,
      (this.gameConfigs as CournotGameConfigs).y,
      (this.gameConfigs as CournotGameConfigs).z,
      firmQuantity,
      totalQuantity
    );
    return profit;
  }

  // this function is called at the end of a round to calculate the market price for a single room
  calculateMarketPriceForRoom(roomId: string): number {
    const totalQuantity: number[] = this.getRoomQuantitiesAsArray(roomId);
    return priceFunction(
      (this.gameConfigs as CournotGameConfigs).x,
      totalQuantity
    );
  }

  // this is called for the calculator to help students visualize their profit
  // move this to the frontend
  calculateMarketPrice(totalMarketProduction: number): number {
    return priceFunction((this.gameConfigs as CournotGameConfigs).x, [
      totalMarketProduction,
    ]);
  }

  /**
   * Calculate the sum of each firm's profit for all the firms in a breakout room
   * @param roomId  - the room id of a specific breakout room and "game"
   */
  calculateTotalProfit(roomId: string): number {
    const roomData = this.roomMap.get(roomId);
    if (!roomData) {
      console.error(`Room data not found for room: ${roomId}`);
      return 0;
    }
    let totalProfit: number = 0;
    for (const user of roomData.userMoves.keys()) {
      const profit = this.calculateProfitForFirm(user.userId);
      totalProfit += profit;
    }
    return totalProfit;
  }

  calculateMaxProfitForFirm(userId: string): number {
    const player = this.players.get(userId);
    if (!player) {
      console.error("Player not found: calculateMaxProfitForFirm()");
      return 0;
    }
    const breakoutRoomId = (player as Student).getBreakoutRoomId();
    if (!breakoutRoomId) {
      console.error("Breakout room not found");
      return 0;
    }
    const roomData = this.roomMap.get(breakoutRoomId);
    if (!roomData) {
      console.error(`Room data does not exist for room: ${breakoutRoomId}`);
      return 0;
    }
    if (!roomData.userMoves) {
      console.error(
        `User moves map does not exist in the breakout room: ${breakoutRoomId}`
      );
      return 0;
    }
    let quantitiesWithoutCurrentFirmQuantity: number[] = [];
    for (const user of roomData.userMoves.keys()) {
      if (user !== (player as Student)) {
        const userMove = roomData.userMoves.get(user);
        if (typeof userMove === "number") {
          quantitiesWithoutCurrentFirmQuantity.push(userMove);
        }
      }
    }
    return maxProfitFunction(
      (this.gameConfigs as CournotGameConfigs).x,
      (this.gameConfigs as CournotGameConfigs).y,
      (this.gameConfigs as CournotGameConfigs).z,
      quantitiesWithoutCurrentFirmQuantity
    );
  }

  calculateMonopolyQuantity(): number {
    return calculateMaxMonopolyQuantity(
      (this.gameConfigs as CournotGameConfigs).x,
      (this.gameConfigs as CournotGameConfigs).y,
      (this.gameConfigs as CournotGameConfigs).z
    );
  }

  /**
   * Calculate the profit for a single firm in a monopoly market for a specific room
   * this shit will contain a simultaneous equation
   * @param roomId
   */
  calculateMonopolyProfit(): number {
    const monopolyQuantity = this.calculateMonopolyQuantity();
    return (
      monopolyQuantity *
        ((this.gameConfigs as CournotGameConfigs).x - monopolyQuantity) -
      monopolyQuantity * (this.gameConfigs as CournotGameConfigs).y +
      2 * monopolyQuantity * (this.gameConfigs as CournotGameConfigs).z
    );
  }

  // TODO
  // return the maximum production for a firm
  // the quantity at which the market price starts to become negative
  calculateMaximumProduction(): number {
    return 0;
  }

  // timer methods
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

    // send data to each user
    for (const user of roomData.users) {
      const userProfit = this.calculateProfitForFirm(user.userId);
      this.io.to(user.getSocket().id).emit("server:userRoundEnd", {
        userProfit,
        userQuantity: roomData.userMoves.get(user),
        roundNo: roomData.roundNo - 1,
        nextRoundNo: roomData.roundNo,
        marketPrice: this.calculateMarketPriceForRoom(breakoutRoomId),
        roomHistory: roomData.roomHistory,
        totalProfit: this.calculateTotalProfit(breakoutRoomId),
        monopolyProfit: this.calculateMonopolyProfit(),
        totalQuantity: this.getTotalRoomQuantity(breakoutRoomId),
        individualProductCost: (this.gameConfigs as CournotGameConfigs).z,
      });
    }

    const maxRounds = (this.gameConfigs as CournotGameConfigs).maxRounds;

    if (roomData.roundNo < maxRounds + 1) {
      setTimeout(() => {
        const roundLength = (this.gameConfigs as CournotGameConfigs)
          .roundLength;
        this.startRoundTimer(breakoutRoomId, roundLength, true);

        this.io.to(breakoutRoomId).emit("server:roundStart", {
          roundNo: roomData.roundNo,
          roundLength,
        });
      }, 15 * 1000); // 15 second delay before moving onto next round
      this.startRoundTimer(breakoutRoomId, 0.25, false);
    } else {
      this.io.to(breakoutRoomId).emit("server:gameEnd", {
        msg: "Game Ended",
        roundHistory: roomData.roundHistory,
      });
    }

    roomData.userMoves.clear();
  }

  /**
   * Data that needs to be saved for each round:
   * Round, Total Production, Your production, market price, cost per unit, your profit
   */
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

    // create a new map for the room if it DNE
    if (!roomData.roomHistory.has(roomData.roundNo)) {
      roomData.roomHistory.set(roomData.roundNo, new Map());
    }

    // set for the entire room
    const roomEndRoundData: Map<string, number | string> = new Map();
    roomEndRoundData.set(
      "totalQuantity",
      this.getTotalRoomQuantity(breakoutRoomId)
    );
    roomEndRoundData.set(
      "marketPrice",
      this.calculateMarketPriceForRoom(breakoutRoomId)
    );
    roomEndRoundData.set(
      "costPerUnit",
      (this.gameConfigs as CournotGameConfigs).z
    );

    roomEndRoundData.set("monopolyProfit", this.calculateMonopolyProfit());

    roomData.roomHistory.set(roomData.roundNo, roomEndRoundData);

    for (let [user, quantity] of roomData.userMoves.entries()) {
      const roundData = roomData.roundHistory.get(roomData.roundNo);
      if (roundData) {
        if (
          quantity !== undefined &&
          (typeof quantity === "number" || typeof quantity === "string")
        ) {
          // set all required quantities into this array to be sent back to the student at the end of the round
          if (typeof quantity === "string") {
            quantity = Number(quantity);
          }
          // set for individual users
          const userEndRoundData: Map<string, number | string> = new Map();
          userEndRoundData.set("move", quantity);
          roundData.set(user, userEndRoundData);
        }
      }
    }
  }

  async onPlayerReconnect(
    socket: Socket,
    userId: string,
    username: string
  ): Promise<void> {
    super.onPlayerReconnect(socket, userId, username);

    const player = this.players.get(userId);

    // If this is a student in a breakout room, we need additional handling
    if (player instanceof Student) {
      const breakoutRoomId = (player as Student).getBreakoutRoomId();

      if (breakoutRoomId) {
        // Make sure the socket joins the breakout room
        socket.join(breakoutRoomId);

        // Send game info to the reconnected player
        this.sendGameInfoToStudent(socket);

        // Get room data
        const roomData = this.roomMap.get(breakoutRoomId);
        if (roomData) {
          // Send current round state
          socket.emit("server:roundStart", {
            roundNo: roomData.roundNo,
            roundLength: (this.gameConfigs as CournotGameConfigs).roundLength,
          });

          // If there's an active timer, send its state
          if (roomData.timerActive) {
            const remainingTime = Math.max(
              0,
              Math.floor((roomData.timerEndTime - Date.now()) / 1000)
            );

            socket.emit("server:timerUpdate", {
              remainingTime,
              active: roomData.timerActive,
              roundTimer: true,
            });
          }

          // If the player had made a move in the current round, restore it
          const userMove = roomData.userMoves.get(player as Student);
          if (userMove !== undefined) {
            socket.emit("server:moveRestored", { action: userMove });
          }
        }
      }
    }
  }
}
