import React from "react";
import { Component } from "react";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import { withRouter } from "react-router-dom";

import ErrorHandlerUiUtils from "../../utils/ErrorHandlerUIUtils";
import VacationsUtils from "../../utils/VacationsUtils";
import { Vacation } from "../../models/vacation";
import { store } from "../../redux/store";
import { Unsubscribe } from "redux";
import { ActionType } from "../../redux/action-type";
import LoginUtils from "../../utils/LoginUtils";
import "./customer.css";

interface customerState {
  vacations: Vacation[];
  isShowSnackbar: boolean;
  snackbarMessage: string;
  socket: any;
}

class Customer extends Component<any, customerState> {
  private unsubscribeStore: Unsubscribe;
  private checkbox: React.RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);

    this.checkbox = React.createRef();

    this.state = {
      vacations: [],
      isShowSnackbar: false,
      snackbarMessage: "",
      socket: store.getState().socket,
    };

    this.unsubscribeStore = store.subscribe(() =>
      this.setState({ socket: store.getState().socket })
    );
  }

  public async componentDidMount() {
    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    try {
      if (token != null) {
        let response = await axios.get(
          this.props.hostUrl + ":3001/users/details"
        );
        const serverResponse = response.data;

        if (
          this.state.socket === undefined ||
          this.state.socket.connected === false
        ) {
          store.dispatch({
            type: ActionType.connectToSocket,
            payload: {
              hostUrl: this.props.hostUrl,
              token: token,
            },
          });
        }

        if (serverResponse.userType !== "Customer") {
          this.props.history.push("/home");
          return;
        }
      } else {
        this.props.history.push("/home");
        return;
      }

      this.registerSocketListeners();

      const response = await axios.get<Vacation[]>(
        this.props.hostUrl + ":3001/vacations"
      );
      this.setState({ vacations: response.data });
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    }
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  private registerSocketListeners = () => {
    this.state.socket.on("add-vacation", (newVacation: Vacation) => {
      let newClientState = { ...this.state };
      newClientState.vacations.push(newVacation);
      this.setState(newClientState);
    });

    this.state.socket.on("delete-vacation", (vacation: Vacation) => {
      let newClientState = { ...this.state };
      let indexForDelete = VacationsUtils.getVacationIndex(
        newClientState,
        vacation
      );
      newClientState.vacations.splice(indexForDelete, 1);
      this.setState(newClientState);
    });

    this.state.socket.on("edit-vacation", (vacation: Vacation) => {
      let newClientState = { ...this.state };
      let indexForUpdate = VacationsUtils.getVacationIndex(
        newClientState,
        vacation
      );
      newClientState.vacations[indexForUpdate] = vacation;
      this.setState(newClientState);
    });

    this.state.socket.on("follow-vacation", (vacation: Vacation) => {
      let newClientState = { ...this.state };
      let index = VacationsUtils.getVacationIndex(newClientState, vacation);
      newClientState.vacations[index].numOfFollowers =
        newClientState.vacations[index].numOfFollowers + 1;
      this.setState(newClientState);
    });

    this.state.socket.on("unfollow-vacation", (vacation: Vacation) => {
      let newClientState = { ...this.state };
      let index = VacationsUtils.getVacationIndex(newClientState, vacation);
      newClientState.vacations[index].numOfFollowers =
        newClientState.vacations[index].numOfFollowers - 1;
      this.setState(newClientState);
    });
  };

  private onFollowClicked = async (vacation: Vacation) => {
    let currentCheckbox = this.checkbox.current;
    currentCheckbox.setAttribute("disabled", "disabled");

    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    try {
      if (!vacation.isFollowed) {
        await axios.post(
          this.props.hostUrl + ":3001/vacations/follow/" + vacation.vacationId
        );
        vacation.numOfFollowers = vacation.numOfFollowers + 1;
        this.state.socket.emit("follow-vacation", vacation);
      } else {
        await axios.delete(
          this.props.hostUrl + ":3001/vacations/unfollow/" + vacation.vacationId
        );
        vacation.numOfFollowers = vacation.numOfFollowers - 1;
        this.state.socket.emit("unfollow-vacation", vacation);
      }
      vacation.isFollowed = !vacation.isFollowed;
      this.setState({ vacations: this.state.vacations });
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    } finally {
      currentCheckbox.removeAttribute("disabled");
    }
  };

  private order = (a: Vacation, b: Vacation) => {
    if (a.isFollowed > b.isFollowed) {
      return -1;
    } else if (a.isFollowed < b.isFollowed) {
      return 1;
    } else {
      return 0;
    }
  };

  render() {
    return (
      <div className="customer">
        <div className="cardContainer">
          {this.state.vacations
            .sort((a, b) => this.order(a, b))
            .map((vacation) => (
              <div
                className="card bg-purple text-white cardBody"
                key={vacation.vacationId}
              >
                <h5 className="card-header">{vacation.destination}</h5>
                <img
                  className="card-img-top image"
                  src={vacation.image}
                  alt={vacation.destination}
                />
                <input
                  type="checkbox"
                  className="checkbox"
                  ref={this.checkbox}
                  id={vacation.vacationId}
                  checked={vacation.isFollowed}
                  onChange={() => this.onFollowClicked(vacation)}
                />
                <label htmlFor={vacation.vacationId}>
                  <svg
                    id="heart-svg"
                    viewBox="467 392 58 57"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      id="Group"
                      fill="none"
                      fillRule="evenodd"
                      transform="translate(467 392)"
                    >
                      <path
                        d="M29.144 20.773c-.063-.13-4.227-8.67-11.44-2.59C7.63 28.795 28.94 43.256 29.143 43.394c.204-.138 21.513-14.6 11.44-25.213-7.214-6.08-11.377 2.46-11.44 2.59z"
                        id="heart"
                        fill="#AAB8C2"
                      />
                      <circle
                        id="main-circ"
                        fill="#E2264D"
                        opacity="0"
                        cx="29.5"
                        cy="29.5"
                        r="1.5"
                      />
                      <g id="grp7" opacity="0" transform="translate(7 6)">
                        <circle id="oval1" fill="#9CD8C3" cx="2" cy="6" r="2" />
                        <circle id="oval2" fill="#8CE8C3" cx="5" cy="2" r="2" />
                      </g>
                      <g id="grp6" opacity="0" transform="translate(0 28)">
                        <circle id="oval1" fill="#CC8EF5" cx="2" cy="7" r="2" />
                        <circle id="oval2" fill="#91D2FA" cx="3" cy="2" r="2" />
                      </g>
                      <g id="grp3" opacity="0" transform="translate(52 28)">
                        <circle id="oval2" fill="#9CD8C3" cx="2" cy="7" r="2" />
                        <circle id="oval1" fill="#8CE8C3" cx="4" cy="2" r="2" />
                      </g>
                      <g
                        id="grp2"
                        opacity="0"
                        transform="translate(44 6)"
                        fill="#CC8EF5"
                      >
                        <circle
                          id="oval2"
                          transform="matrix(-1 0 0 1 10 0)"
                          cx="5"
                          cy="6"
                          r="2"
                        />
                        <circle
                          id="oval1"
                          transform="matrix(-1 0 0 1 4 0)"
                          cx="2"
                          cy="2"
                          r="2"
                        />
                      </g>
                      <g
                        id="grp5"
                        opacity="0"
                        transform="translate(14 50)"
                        fill="#91D2FA"
                      >
                        <circle
                          id="oval1"
                          transform="matrix(-1 0 0 1 12 0)"
                          cx="6"
                          cy="5"
                          r="2"
                        />
                        <circle
                          id="oval2"
                          transform="matrix(-1 0 0 1 4 0)"
                          cx="2"
                          cy="2"
                          r="2"
                        />
                      </g>
                      <g
                        id="grp4"
                        opacity="0"
                        transform="translate(35 50)"
                        fill="#F48EA7"
                      >
                        <circle
                          id="oval1"
                          transform="matrix(-1 0 0 1 12 0)"
                          cx="6"
                          cy="5"
                          r="2"
                        />
                        <circle
                          id="oval2"
                          transform="matrix(-1 0 0 1 4 0)"
                          cx="2"
                          cy="2"
                          r="2"
                        />
                      </g>
                      <g
                        id="grp1"
                        opacity="0"
                        transform="translate(24)"
                        fill="#9FC7FA"
                      >
                        <circle id="oval1" cx="2.5" cy="3" r="2" />
                        <circle id="oval2" cx="7.5" cy="2" r="2" />
                      </g>
                    </g>
                  </svg>
                </label>
                <div className="vacationBody">
                  <p className="card-text description">
                    {vacation.description}
                  </p>
                  <p className="card-text">
                    {vacation.startDate} - {vacation.endDate}
                  </p>
                </div>
                <div className="vacationFooter card-footer">
                  <p>{vacation.price}$</p>
                  <i className="far fa-grin-hearts fa-1x"></i>
                  <span className="faIcon">{vacation.numOfFollowers}</span>
                </div>
              </div>
            ))}
        </div>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.isShowSnackbar}
          message={this.state.snackbarMessage}
        />
      </div>
    );
  }
}

export default withRouter(Customer);
