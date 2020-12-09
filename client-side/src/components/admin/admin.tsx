import React, { ChangeEvent } from "react";
import axios from "axios";
import { NavLink, withRouter } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import moment from "moment";
import { Unsubscribe } from "redux";
import { Component } from "react";

import ErrorHandlerUiUtils from "../../utils/ErrorHandlerUIUtils";
import VacationsUtils from "../../utils/VacationsUtils";
import { ActionType } from "../../redux/action-type";
import { store } from "../../redux/store";
import { Vacation } from "../../models/vacation";
import LoginUtils from "../../utils/LoginUtils";
import "./admin.css";

interface adminState {
  vacations: Vacation[];
  isShowModal: boolean;
  isShowUpdateButton: boolean;
  minDate: any;
  isShowSnackbar: boolean;
  snackbarMessage: string;
  fileInputLabel: string;
  imageForPreview: any;
  socket: any;
}

class Admin extends Component<any, adminState> {
  private unsubscribeStore: Unsubscribe;
  private vacation = new Vacation("", "", "", 0, "", "", "");
  private btn: React.RefObject<HTMLButtonElement>;
  private fileToDelete: string;

  constructor(props: any) {
    super(props);

    this.btn = React.createRef();

    this.state = {
      vacations: [],
      isShowModal: false,
      isShowUpdateButton: false,
      minDate: moment(new Date()).format("YYYY-MM-DD"),
      isShowSnackbar: false,
      snackbarMessage: "",
      fileInputLabel: "Choose file",
      imageForPreview: this.props.hostUrl + ":3001/no-image.jpg",
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
  };

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  private registerSocketListeners = () => {
    this.state.socket.on("follow-vacation", (vacation: Vacation) => {
      let newAdminState = { ...this.state };
      let index = VacationsUtils.getVacationIndex(newAdminState, vacation);
      newAdminState.vacations[index].numOfFollowers =
        newAdminState.vacations[index].numOfFollowers + 1;
      this.setState(newAdminState);
    });

    this.state.socket.on("unfollow-vacation", (vacation: Vacation) => {
      let newAdminState = { ...this.state };
      let index = VacationsUtils.getVacationIndex(newAdminState, vacation);
      newAdminState.vacations[index].numOfFollowers =
        newAdminState.vacations[index].numOfFollowers - 1;
      this.setState(newAdminState);
    });
  };

  private onHandleModalButtonsDisplay = (
    isShowUpdateButton: boolean,
    vacation?: Vacation
  ) => {
    let newAdminState = { ...this.state };
    newAdminState.isShowModal = !newAdminState.isShowModal;

    //on edit vacation
    if (isShowUpdateButton === true) {
      newAdminState.isShowUpdateButton = isShowUpdateButton;
      newAdminState.minDate = moment(new Date()).format("YYYY-MM-DD");
      newAdminState.fileInputLabel = vacation.image.slice(
        this.props.hostUrl + ":3001/".length,
        vacation.image.length
      );
      newAdminState.imageForPreview = vacation.image;
      this.fileToDelete = vacation.image;
    } else {
      //on add vacation
      newAdminState.minDate = moment(new Date()).format("YYYY-MM-DD");
      newAdminState.imageForPreview = this.props.hostUrl + ":3001/no-image.jpg";
      newAdminState.fileInputLabel = "Choose file";
    }

    this.setState(newAdminState);

    //init for form inputs
    this.vacation = new Vacation(
      "",
      this.props.hostUrl + ":3001/no-image.jpg",
      "",
      0,
      "",
      "",
      ""
    );
  };

  private setDestination = (event: ChangeEvent<HTMLInputElement>) => {
    const destination = event.target.value;

    this.vacation.destination = destination;
  };

  private setDescription = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const description = event.target.value;

    this.vacation.description = description;
  };

  private setImage = (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files[0];

    //for preview
    let reader = new FileReader();
    reader.onload = (e) => {
      let newAdminState = { ...this.state };
      newAdminState.imageForPreview = e.target.result;
      newAdminState.fileInputLabel = image.name;
      this.setState(newAdminState);
    };

    reader.readAsDataURL(image);

    this.vacation.image = image;
  };

  private setStartDate = (event: ChangeEvent<HTMLInputElement>) => {
    let startDate = event.target.value;

    let minDate = moment(startDate).format("YYYY-MM-DD");

    this.setState({ minDate });
    this.vacation.startDate = startDate;
  };

  private setEndDate = (event: ChangeEvent<HTMLInputElement>) => {
    let endDate = event.target.value;

    this.vacation.endDate = endDate;
  };

  private setPrice = (event: ChangeEvent<HTMLInputElement>) => {
    const price = +event.target.value;

    this.vacation.price = price;
  };

  private fixDateFormat(date: string) {
    date = moment(date, "YYYY-MM-DD").format("DD/MM/YYYY");
  }

  private onCreateVacationClicked = async () => {
    if (!this.isFormFieldsValid()) {
      return;
    }

    let currentButton = this.btn.current;
    currentButton.setAttribute("disabled", "disabled");

    const data = new FormData();
    data.append("file", this.vacation.image);

    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    try {
      const res = await axios.post(
        this.props.hostUrl + ":3001/vacations/upload",
        data,
        {}
      );

      this.vacation.image = res.data.filename;

      let newVacationDetails = this.vacation;

      const response = await axios.post(
        this.props.hostUrl + ":3001/vacations/add",
        newVacationDetails
      );

      //fix format for UI use
      this.fixDateFormat(response.data.startDate);
      this.fixDateFormat(response.data.endDate);

      this.state.socket.emit("add-vacation", response.data);

      let newAdminState = { ...this.state };
      newAdminState.isShowModal = !newAdminState.isShowModal;
      newAdminState.vacations.push(response.data);
      newAdminState.fileInputLabel = "Choose file";
      this.setState(newAdminState);

      //init instance for next usage
      this.vacation = new Vacation(
        "",
        this.props.hostUrl + ":3001/no-image.jpg",
        "",
        0,
        "",
        "",
        ""
      );
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    } finally {
      currentButton.removeAttribute("disabled");
    }
  };

  private isFormFieldsValid = () => {
    //validation
    if (
      this.vacation.destination.trim() === "" ||
      this.vacation.description.trim() === "" ||
      this.vacation.image === "" ||
      this.vacation.image === this.props.hostUrl + ":3001/no-image.jpg" ||
      this.vacation.startDate.trim() === "" ||
      this.vacation.endDate.trim() === "" ||
      this.vacation.price === +""
    ) {
      ErrorHandlerUiUtils.showSnackbar(
        "All fields must be filled correctly!",
        this
      );
      ErrorHandlerUiUtils.hideSnackbar(this);
      return false;
    }

    if (
      Date.parse(this.vacation.endDate) <= Date.parse(this.vacation.startDate)
    ) {
      ErrorHandlerUiUtils.showSnackbar(
        "End date is earlier than Start date!",
        this
      );
      ErrorHandlerUiUtils.hideSnackbar(this);
      return false;
    }

    if (
      this.vacation.destination.length < 2 ||
      this.vacation.description.length < 10
    ) {
      let errorMessage = "some of the text fields you entered are too short!";
      ErrorHandlerUiUtils.showSnackbar(errorMessage, this);
      ErrorHandlerUiUtils.hideSnackbar(this);
      return false;
    }

    if (
      this.vacation.destination.length > 45 ||
      this.vacation.description.length > 1000
    ) {
      let errorMessage = "some of the text fields you entered are too long!";
      ErrorHandlerUiUtils.showSnackbar(errorMessage, this);
      ErrorHandlerUiUtils.hideSnackbar(this);
      return false;
    }

    return true;
  };

  private onUpdateVacationClicked = async () => {
    if (!this.isFormFieldsValid()) {
      return;
    }

    let currentButton = this.btn.current;
    currentButton.setAttribute("disabled", "disabled");

    const data = new FormData();
    data.append("fileToDelete", this.fileToDelete);
    data.append("file", this.vacation.image);

    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    try {
      if (this.vacation.image !== this.fileToDelete) {
        const res = await axios.post(
          this.props.hostUrl + ":3001/vacations/upload",
          data,
          {}
        );
        this.vacation.image = res.data.filename;
      }

      await axios.put(
        this.props.hostUrl + ":3001/vacations/update",
        this.vacation
      );

      //fix format for UI use
      this.fixDateFormat(this.vacation.startDate);
      this.fixDateFormat(this.vacation.endDate);

      this.state.socket.emit("edit-vacation", this.vacation);

      let newAdminState = { ...this.state };
      newAdminState.isShowModal = !newAdminState.isShowModal;

      let indexForUpdate = VacationsUtils.getVacationIndex(
        newAdminState,
        this.vacation
      );

      newAdminState.vacations[indexForUpdate] = this.vacation;
      this.setState(newAdminState);

      //init instance for next usage
      this.vacation = new Vacation(
        "",
        this.props.hostUrl + ":3001/no-image.jpg",
        "",
        0,
        "",
        "",
        ""
      );
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    } finally {
      currentButton.removeAttribute("disabled");
    }
  };

  private onShowEditModalClicked = (vacation: Vacation) => {
    this.onHandleModalButtonsDisplay(true, vacation);

    let newStartDate = vacation.startDate.split("/").reverse().join("-");
    let newEndDate = vacation.endDate.split("/").reverse().join("-");

    // fill fields with required info
    this.vacation = new Vacation(
      vacation.vacationId,
      vacation.image,
      vacation.destination,
      vacation.price,
      vacation.description,
      newStartDate,
      newEndDate,
      vacation.numOfFollowers
    );
  };

  private onDeleteVactionClicked = async (vacation: Vacation) => {
    let token = sessionStorage.getItem("token");
    LoginUtils.setTokenToAxiosHeader(token);

    try {
      await axios.delete(
        this.props.hostUrl + ":3001/vacations/delete/" + vacation.vacationId
      );

      this.state.socket.emit("delete-vacation", vacation);

      let newAdminState = { ...this.state };
      let indexForDelete = VacationsUtils.getVacationIndex(
        newAdminState,
        vacation
      );
      newAdminState.vacations.splice(indexForDelete, 1);
      this.setState(newAdminState);
    } catch (error) {
      ErrorHandlerUiUtils.handleErrorsOnUi(error, this);
    }
  };

  render() {
    return (
      <div className="admin">
        {/* Modal NGIF */}
        {this.state.isShowModal && (
          <div className="popUp">
            <div className="modalContainer">
              <div className="imageForPreview">
                <img
                  src={this.state.imageForPreview}
                  alt={this.vacation.destination}
                  className="rounded-circle"
                />
              </div>

              <div className="formContainer">
                <i
                  className="fas fa-times fa-2x closePopUp"
                  onClick={() => this.onHandleModalButtonsDisplay(false)}
                />

                <div className="form">
                  <div className="custom-file fileInput">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="inputGroupFile01"
                      aria-describedby="inputGroupFileAddon01"
                      accept="image/*"
                      onChange={this.setImage}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="inputGroupFile01">
                      <i className="fas fa-upload fa-2x nonDecoration" />
                      {this.state.fileInputLabel}
                    </label>
                  </div>
                  {!this.state.isShowUpdateButton && (
                    <h2>Add a new vacation</h2>
                  )}
                  {this.state.isShowUpdateButton && <h2>Update a vacation</h2>}

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Destination"
                    defaultValue={this.vacation.destination}
                    onChange={this.setDestination}
                  />

                  <textarea
                    rows={5}
                    className="form-control"
                    placeholder="Description..."
                    defaultValue={this.vacation.description}
                    onChange={this.setDescription}
                  ></textarea>

                  <div className="input-group">
                    <div className="dates">
                      <label>Start date: </label>
                      <input
                        type="date"
                        className="form-control date"
                        min={this.state.minDate}
                        max={"2100-01-01"}
                        defaultValue={this.vacation.startDate}
                        onChange={this.setStartDate}
                        onKeyDown={(e) => e.preventDefault()}
                      ></input>
                    </div>
                    <label
                      className="separator"
                      style={{ marginLeft: "10px", marginRight: "10px" }}
                    >
                      -{" "}
                    </label>
                    <div className="dates">
                      <label>End date: </label>
                      <input
                        type="date"
                        className="form-control date"
                        min={this.state.minDate}
                        max={"2100-01-01"}
                        defaultValue={this.vacation.endDate}
                        onChange={this.setEndDate}
                        onKeyDown={(e) => e.preventDefault()}
                      ></input>
                    </div>
                  </div>

                  <div className="input-group">
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      id="price"
                      placeholder="Price"
                      defaultValue={this.vacation.price}
                      onChange={this.setPrice}
                    />
                    <label className="price" htmlFor="price">
                      $
                    </label>
                  </div>

                  {!this.state.isShowUpdateButton && (
                    <div>
                      <button
                        ref={this.btn}
                        onClick={() => this.onCreateVacationClicked()}
                      >
                        Create
                      </button>
                    </div>
                  )}
                  {this.state.isShowUpdateButton && (
                    <div>
                      <button
                        ref={this.btn}
                        onClick={() => this.onUpdateVacationClicked()}
                      >
                        Update
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="administration">
          <i
            className="fas fa-plus fa-2x"
            onClick={() => this.onHandleModalButtonsDisplay(false)}
          >
            <span className="nonDecoration">Add vacation</span>
          </i>
          <i className="fas fa-chart-bar fa-2x faIcon">
            <span>
              <NavLink className="nonDecoration" to="/reports" exact>
                Reports
              </NavLink>
            </span>
          </i>
        </div>
        <div className="cardContainer">
          {this.state.vacations.map((vacation) => (
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
              <div className="iconsBar">
                <i
                  className="fas fa-pencil-alt fa-2x nonDecoration"
                  onClick={() => this.onShowEditModalClicked(vacation)}
                ></i>
                <i
                  className="fas fa-trash-alt fa-2x faIcon nonDecoration"
                  onClick={() => this.onDeleteVactionClicked(vacation)}
                ></i>
              </div>
              <div className="vacationBody">
                <p className="card-text description">{vacation.description}</p>
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

export default withRouter(Admin);
