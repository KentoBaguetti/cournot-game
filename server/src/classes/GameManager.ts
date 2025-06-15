import { BaseGame } from "./games/BaseGame";

export class GameManager {
  // instance variables
  public games: Map<string, BaseGame> = new Map(); // store as gameName+someNumber : game

  addGame(roomId: string, game: BaseGame): void {
    this.games.set(roomId, game);
  }

  getGame(roomId: string): BaseGame | undefined {
    return this.games.get(roomId);
  }

  removeGame(roomId: string): void {
    this.games.delete(roomId);
  }
}
