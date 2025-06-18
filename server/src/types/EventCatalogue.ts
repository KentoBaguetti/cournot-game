// Client --> Server
export interface ClientToServerEvents {
    // host events
    "host:createGame": (gameType: string) => void;
    "host:joinGame": (roomId: string) => void;
    "host:startGame": () => void;
    "host:endGame": () => void;
    "host:resetGame": () => void;
    "host:pauseGame": () => void;
    "host:resumeGame": () => void;
    "host:getUsersInRoom": () => void;
    "host:getGameState": () => void;

    // player events
    "player:joinGame": (roomId: string) => void;
    "player:leaveGame": () => void;
    "player:sendAction": (action: string) => void;

    // both events
    "common:ping": () => void;
}

// Server --> Client
export interface ServerToClientEvents {
    "game:gameCreated": (roomId: string) => void;
    "game:userJoined": (userId: string) => void;
    "game:userLeft": (userId: string) => void;
    "game:gameStarted": () => void;
    "game:gameEnded": () => void;
    "game:gameReset": () => void;
    "game:gamePaused": () => void;
    "game:gameResumed": () => void;
    "game:gameState": (gameState: any) => void;
}
