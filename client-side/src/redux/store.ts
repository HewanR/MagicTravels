import { createStore } from "redux";

import { AppState } from "./app-state";
import { reduce } from "./reducer";

export const store = createStore(reduce, new AppState());