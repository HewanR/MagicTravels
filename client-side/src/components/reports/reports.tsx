import React from "react";
import { Component } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { withRouter } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";

import { Vacation } from "../../models/vacation";
import ErrorHandlerUiUtils from "../../utils/ErrorHandlerUIUtils";
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import LoginUtils from "../../utils/LoginUtils";
import "./reports.css";

interface reportsState {
  labels: any;
  data: any;
  isShowSnackbar: boolean;
  snackbarMessage: string;
  socket: any;
}

class Reports extends Component<any, reportsState> {
  private unsubscribeStore: Unsubscribe;

  public constructor(props: any) {
    super(props);

    this.state = {
      labels: [],
      data: [],
      isShowSnackbar: false,
      snackbarMessage: "",
      socket: store.getState().socket,
    };

    this.unsubscribeStore = store.subscribe(() =>
      this.setState({ socket: store.getState().socket })
    );
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

        if (serverResponse.userType !== "Admin") {
          this.props.history.push("/customer");
          return;
        }
      } else {
        this.props.history.push("/home");
        return;
      }

      this.registerSocketListeners();

      const response = await axios.get(
        this.props.hostUrl + ":3001/vacations/reports"
      );

      let labels = [];
      let data = [];

      for (let index = 0; index < response.data.length; index++) {
        labels.push(response.data[index].destination);
        data.push(response.data[index].numOfFollowers);
      }

      let newReportsState = { ...this.state };
      newReportsState.labels = labels;
      newReportsState.data = data;
      this.setState(newReportsState);
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    }
  };

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  private randomColors = () => {
    let colorsArray = [];
    for (let index = 0; index < this.state.labels.length; index++) {
      let r = Math.floor(Math.random() * 256);
      let g = Math.floor(Math.random() * 256);
      let b = Math.floor(Math.random() * 256);
      colorsArray.push("rgba(" + r + "," + g + "," + b + ",0.2)");
    }
    return colorsArray;
  };

  private registerSocketListeners = () => {
    this.state.socket.on("follow-vacation", (vacation: Vacation) => {
      let newReportsState = { ...this.state };

      if (newReportsState.labels.includes(vacation.destination)) {
        let indexForUpdate = newReportsState.labels.indexOf(
          vacation.destination
        );
        newReportsState.data[indexForUpdate] =
          newReportsState.data[indexForUpdate] + 1;
      } else {
        newReportsState.labels.push(vacation.destination);
        newReportsState.data.push(1);
      }

      this.setState(newReportsState);
    });

    this.state.socket.on("unfollow-vacation", (vacation: Vacation) => {
      let newReportsState = { ...this.state };
      let indexForUpdate = newReportsState.labels.indexOf(vacation.destination);

      if (newReportsState.data[indexForUpdate] === 1) {
        newReportsState.data.splice(indexForUpdate, 1);
        newReportsState.labels.splice(indexForUpdate, 1);
      } else if (newReportsState.data[indexForUpdate] > 1) {
        newReportsState.data[indexForUpdate] =
          newReportsState.data[indexForUpdate] - 1;
      }

      this.setState(newReportsState);
    });
  };

  render() {
    return (
      <div className="reports">
        <h1>REPORTS</h1>
        <Bar
          redraw
          data={{
            labels: this.state.labels,
            datasets: [
              {
                backgroundColor: this.randomColors(),
                borderColor: this.randomColors(),
                borderWidth: 2,
                data: this.state.data,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            title: {
              display: false,
            },
            legend: {
              display: false,
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    min: 0,
                    stepSize: 1,
                  },
                },
              ],
            },
          }}
          width={200}
          height={180}
        />
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.isShowSnackbar}
          message={this.state.snackbarMessage}
        />
      </div>
    );
  }
}

export default withRouter(Reports);
