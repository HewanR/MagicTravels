import React, { Component } from "react";
import { Unsubscribe } from "redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import ErrorHandlerUiUtils from "../../utils/ErrorHandlerUIUtils";
import { ActionType } from "../../redux/action-type";
import { store } from "../../redux/store";
import ScrollTop from "./scrollTop";
import LoginUtils from "../../utils/LoginUtils";
import "./navBar.css";

interface navBarState {
  isUserLoggedIn: boolean;
  isShowSnackbar: boolean;
  snackbarMessage: string;
  socket: any;
}

class NavBar extends Component<any, navBarState> {
  private unsubscribeStore: Unsubscribe;
  private btn: React.RefObject<HTMLButtonElement>;

  constructor(props: any) {
    super(props);

    this.btn = React.createRef();

    this.state = {
      isUserLoggedIn: store.getState().isUserLoggedIn,
      isShowSnackbar: false,
      snackbarMessage: "",
      socket: store.getState().socket,
    };
  }

  public componentDidMount = () => {
    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    this.unsubscribeStore = store.subscribe(() =>
      this.setState({
        isUserLoggedIn: store.getState().isUserLoggedIn,
        socket: store.getState().socket,
      })
    );

    if (token != null) {
      store.dispatch({ type: ActionType.updateIsUserLoggedIn });
    }
  };

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  public onLogOutClicked = async () => {
    this.btn.current.setAttribute("disabled", "disabled");

    try {
      this.state.socket.disconnect();

      let token = sessionStorage.getItem("token");
      LoginUtils.setTokenToAxiosHeader(token);

      await axios.post(this.props.hostUrl + ":3001/users/logout");

      ErrorHandlerUiUtils.showSnackbar("Logging-out...", this);
      ErrorHandlerUiUtils.hideSnackbar(this);
      ErrorHandlerUiUtils.sendBackToHomePage(this);
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    }
  };

  public render() {
    return (
      <div className="navBar">
        <React.Fragment>
          <AppBar>
            <Toolbar>
              <h3
                className="title"
                onClick={() => this.props.history.push("/home")}
              >
                Magic Travels
              </h3>
              <div className="helloContainer">
                <ul className="navbar-nav">
                  <li>
                    {this.state.isUserLoggedIn && (
                      <div className="hello">
                        <span>Hello {sessionStorage.getItem("userName")}</span>
                        <button ref={this.btn} onClick={this.onLogOutClicked}>
                          Log Out
                        </button>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            </Toolbar>
          </AppBar>
          <ScrollTop {...this.props} />
        </React.Fragment>

        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.isShowSnackbar}
          message={this.state.snackbarMessage}
        />
      </div>
    );
  }
}
export default withRouter(NavBar);
