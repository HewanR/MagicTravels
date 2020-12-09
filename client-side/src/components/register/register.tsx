import React from "react";
import { ChangeEvent, Component } from "react";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import { withRouter } from "react-router-dom";
import GoogleLogin from "react-google-login";

import { SuccessfulLoginServerResponse } from "../../models/SuccessfulLoginServerResponse";
import { UserRegisterDetails } from "../../models/UserRegisterDetails";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import ErrorHandlerUiUtils from "../../utils/ErrorHandlerUIUtils";
import LoginUtils from "../../utils/LoginUtils";
import "./register.css";

interface RegisterState {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  isShowSnackbar: boolean;
  snackbarMessage: string;
  isShowNote: boolean;
  noteToUser?: string;
}

class Register extends Component<any, RegisterState> {
  private btn: React.RefObject<HTMLButtonElement>;

  public constructor(props: any) {
    super(props);

    this.btn = React.createRef();

    this.state = {
      firstName: "",
      lastName: "",
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

    try {
      if (token != null) {
        let response = await axios.get(
          this.props.hostUrl + ":3001/users/details"
        );
        const serverResponse = response.data;

        LoginUtils.routeUserToMainPage(serverResponse.userType, this);

      }
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    }
  };

  private setFirstName = (event: ChangeEvent<HTMLInputElement>) => {
    const firstName = event.target.value;

    if (firstName.length > 20) {
      event.target.style.border = "red 1px solid";
    }

    event.target.style.border = "gray 1px solid";

    this.setState({ firstName });
  };

  private setLastName = (event: ChangeEvent<HTMLInputElement>) => {
    const lastName = event.target.value;

    if (lastName.length > 20) {
      event.target.style.border = "red 1px solid";
    }

    event.target.style.border = "gray 1px solid";

    this.setState({ lastName });
  };

  private setUserName = (event: ChangeEvent<HTMLInputElement>) => {
    const userName = event.target.value;

    if (userName.length > 20) {
      event.target.style.border = "red 1px solid";
    }

    event.target.style.border = "gray 1px solid";

    this.setState({ userName });
  };

  private setPassword = (event: ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;

    if (password.length > 20) {
      event.target.style.border = "red 1px solid";
    }

    event.target.style.border = "gray 1px solid";

    this.setState({ password });
  };

  private isFormFeildsValid = () => {
    //validations
    if (
      this.state.firstName.trim() === "" ||
      this.state.lastName.trim() === "" ||
      this.state.userName.trim() === "" ||
      this.state.password.trim() === ""
    ) {
      let newRegisterState = { ...this.state };
      newRegisterState.isShowNote = true;
      newRegisterState.noteToUser = "All fields must be filled!";
      this.setState(newRegisterState);
      return false;
    }

    if (
      this.state.firstName.length > 20 ||
      this.state.lastName.length > 20 ||
      this.state.userName.length > 20 ||
      this.state.password.length > 20
    ) {
      let newRegisterState = { ...this.state };
      newRegisterState.isShowNote = true;
      newRegisterState.noteToUser = "Fields can include max 20 characters";
      this.setState(newRegisterState);
      return false;
    }

    if (this.state.password.length < 6) {
      let newRegisterState = { ...this.state };
      newRegisterState.isShowNote = true;
      newRegisterState.noteToUser =
        "Password must include at least 6 characters";
      this.setState(newRegisterState);
      return false;
    }

    this.setState({ isShowNote: false });
    return true;
  };

  private onSignupBtnClicked = async () => {
    if (!this.isFormFeildsValid()) {
      return;
    }

    let currentButton = this.btn.current;
    currentButton.setAttribute("disabled", "disabled");

    try {
      console.log("Entered register");

      let userRegisterDetails = new UserRegisterDetails(
        this.state.firstName,
        this.state.lastName,
        this.state.userName,
        this.state.password
      );

      const response = await axios.post<SuccessfulLoginServerResponse>(
        this.props.hostUrl + ":3001/users/register",
        userRegisterDetails
      );
      const serverResponse = response.data;

      let token = serverResponse.token;
      LoginUtils.setTokenToAxiosHeader(token);

      store.dispatch({ type: ActionType.updateIsUserLoggedIn });

      LoginUtils.setUserCache(serverResponse.token, this.state.userName);

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
      <div className="register">
        <h1>SIGN UP</h1>
        <input
          type="text"
          placeholder="First Name"
          value={this.state.firstName}
          onChange={this.setFirstName}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={this.state.lastName}
          onChange={this.setLastName}
        />
        <input
          type="text"
          placeholder="User Name"
          value={this.state.userName}
          onChange={this.setUserName}
        />
        <input
          type="password"
          placeholder="Password"
          value={this.state.password}
          onChange={this.setPassword}
        />
        <button ref={this.btn} onClick={this.onSignupBtnClicked}>
          Sign Up
        </button>
        <div className="col-md-3 text-center" style={{ flexBasis: "0" }}>
          <GoogleLogin
            clientId="357689223091-bfceio0tfcbvtoqvk5ac32ctbi7scdnh.apps.googleusercontent.com"
            buttonText="Sign-Up with Google"
            onSuccess={(response) => LoginUtils.responseSuccessfulGoogle(response, this)}
            onFailure={(response) => LoginUtils.responseFailureGoogle(response)}
            cookiePolicy={"single_host_origin"}
          />
        </div>
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

export default withRouter(Register);
