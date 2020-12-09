import socketIOClient from "socket.io-client";

import { Action } from "./action";
import { ActionType } from "./action-type";
import { AppState } from "./app-state";

export function reduce(oldAppState: AppState, action: Action): AppState {
    const newAppState = { ...oldAppState };

    switch (action.type) {

        case ActionType.updateIsUserLoggedIn:
            newAppState.isUserLoggedIn = !newAppState.isUserLoggedIn
            break;
        case ActionType.connectToSocket:
            newAppState.socket = socketIOClient(action.payload.hostUrl + ":3002", {
                query: "token=" + action.payload.token,
              }).connect();
            break;

    }
    return newAppState;
}