import React, { ChangeEvent } from "react";
import { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";
import axios from "axios";
import GoogleLogin from "react-google-login";
import Snackbar from "@material-ui/core/Snackbar";

import { SuccessfulLoginServerResponse } from "../../models/SuccessfulLoginServerResponse";
import { UserLoginDetails } from "../../models/UserLoginDetails";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import ErrorHandlerUiUtils from "../../utils/ErrorHandlerUIUtils";
import LoginUtils from "../../utils/LoginUtils";
import "./login.css";

interface LoginState {
  userName: string;
  password: string;
  isShowSnackbar: boolean;
  snackbarMessage: string;
  isShowNote: boolean;
  noteToUser?: string;
}

class Login extends Component<any, LoginState> {
  private btn: React.RefObject<HTMLButtonElement>;

  public constructor(props: any) {
    super(props);

    this.btn = React.createRef();

    this.state = {
      userName: "",
      password: "",
      isShowSnackbar: false,
      snackbarMessage: "",
      isShowNote: false,
    };
  }

  public componentDidMount = async () => {
    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    if (token != null) {
      try {
        let response = await axios.get(
          this.props.hostUrl + ":3001/users/details"
        );
        const serverResponse = response.data;

        LoginUtils.routeUserToMainPage(serverResponse.userType, this);
       
      } catch (error) {
        ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
      }
    }
  };

  private setUserName = (event: ChangeEvent<HTMLInputElement>) => {
    const userName = event.target.value;
    this.setState({ userName });
  };

  private setPassword = (event: ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    this.setState({ password });
  };

  private onLoginBtnClicked = async () => {
    if (
      this.state.userName.trim() === "" ||
      this.state.password.trim() === ""
    ) {
      let newLoginState = { ...this.state };
      newLoginState.isShowNote = true;
      newLoginState.noteToUser = "All fields must be filled!";
      this.setState(newLoginState);
      return;
    }

    let currentButton = this.btn.current;
    currentButton.setAttribute("disabled", "disabled");

    try {
      console.log("Entered login");

      let userLoginDetails = new UserLoginDetails(
        this.state.userName,
        this.state.password
      );
      const response = await axios.post<SuccessfulLoginServerResponse>(
        this.props.hostUrl + ":3001/users/login",
        userLoginDetails
      );
      const serverResponse = response.data;

      let token = serverResponse.token;
      LoginUtils.setTokenToAxiosHeader(token);

      store.dispatch({ type: ActionType.updateIsUserLoggedIn });

      LoginUtils.setUserCache(serverResponse.token, this.state.userName)

      store.dispatch({
        type: ActionType.connectToSocket,
        payload: { hostUrl: this.props.hostUrl, token: serverResponse.token },
      });

      LoginUtils.routeUserToMainPage(serverResponse.userType, this);

    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    } finally {
      currentButton.removeAttribute("disabled");
    }
  };

  public render() {
    return (
      <div className="login">
        <h1>LOGIN</h1>
        <input
          type="text"
          placeholder="User name"
          value={this.state.userName}
          onChange={this.setUserName}
        />
        <input
          type="password"
          placeholder="Password"
          value={this.state.password}
          onChange={this.setPassword}
        />
        <button ref={this.btn} onClick={this.onLoginBtnClicked}>
          login
        </button>

        <div className="col-md-3 text-center" style={{ flexBasis: "0" }}>
          <GoogleLogin
            clientId="357689223091-bfceio0tfcbvtoqvk5ac32ctbi7scdnh.apps.googleusercontent.com"
            buttonText="Login with Google"
            onSuccess={(response) => LoginUtils.responseSuccessfulGoogle(response, this)}
            onFailure={(response) => LoginUtils.responseFailureGoogle(response)}
            cookiePolicy={"single_host_origin"}
          />
        </div>
        <p>
          Not a member?{" "}
          <span>
            {" "}
            <NavLink to="/register" exact>
              Sign up now
            </NavLink>
          </span>
        </p>
        {this.state.isShowNote && (
          <p className="noteToUser">{this.state.noteToUser}</p>
        )}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.isShowSnackbar}
          message={this.state.snackbarMessage}
        />
      </div>
    );
  }
}

export default withRouter(Login);
