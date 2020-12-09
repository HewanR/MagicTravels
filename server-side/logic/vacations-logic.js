const vacationsDao = require("../dao/vacations-dao");
const ServerError = require("../errors/server-error");
const ErrorType = require("../errors/error-type");

const hostUrl = "http://localhost";

function getUserDetails(token) {
  let pureToken = token.split(" ").pop();

  let userDetails = vacationsDao.getUserDetails(pureToken);

  return userDetails;
}

function isAdmin(token){
  let { userType } = getUserDetails(token);

  if (userType == "Admin") {
    return true;
  }
  return false;
}

function validateInputFeilds(vacation) {
  //validation
  if (
    vacation.destination.trim() === "" ||
    vacation.description.trim() === "" ||
    vacation.image === "" ||
    vacation.image === hostUrl + ":3001/no-image.jpg" ||
    vacation.startDate.trim() === "" ||
    vacation.endDate.trim() === "" ||
    vacation.price === +""
  ) {
    ErrorType.INVALID_INPUT_FEILD.message = "All fields must be filled!";
    throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
  }

  if (Date.parse(vacation.endDate) <= Date.parse(vacation.startDate)) {
    ErrorType.INVALID_INPUT_FEILD.message =
      "End date is earlier than Start date!";
    throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
  }

  if (vacation.destination.length < 2 || vacation.description.length < 10) {
    ErrorType.INVALID_INPUT_FEILD.message =
      "some of the text fields you entered are too short!";
    throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
  }

  if (vacation.destination.length > 45 || vacation.description.length > 1000) {
    ErrorType.INVALID_INPUT_FEILD.message =
      "some of the text fields you entered are too long!";
    throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
  }
}

async function getAllVacations(token) {
  let { userId } = getUserDetails(token);

  let successfulVacationList = await vacationsDao.getAllVacations(userId);

  for (vacation of successfulVacationList) {
    if (vacation.userId != userId) {
      vacation.isFollowed = false;
    } else {
      vacation.isFollowed = true;
    }
    vacation.image = hostUrl + ":3001/" + vacation.image;
  }

  return successfulVacationList;
}

async function addVacation(vacation, token) {
  if (!isAdmin(token)) {
    throw new ServerError(ErrorType.ACCESS_DENIED);
  }

  validateInputFeilds(vacation);

  vacation.image = vacation.image.slice(
    hostUrl + ":3001/".length,
    vacation.image.length
  );

  let newVacation = await vacationsDao.addVacation(vacation);

  newVacation.image = hostUrl + ":3001/" + newVacation.image;

  return newVacation;
}

async function deleteVacation(vacationId, token) {
  if (!isAdmin(token)) {
    throw new ServerError(ErrorType.ACCESS_DENIED);
  }

  let imageForDelete = await vacationsDao.getImageForDelete(vacationId);

  await vacationsDao.deleteVacation(vacationId);

  return imageForDelete;
}

async function followVacation(vacationId, token) {
  let { userId } = getUserDetails(token);
  await vacationsDao.followVacation(vacationId, userId);
}

async function unfollowVacation(vacationId, token) {
  let { userId } = getUserDetails(token);
  await vacationsDao.unfollowVacation(vacationId, userId);
}

async function updateVacation(vacation, token) {
 if (!isAdmin(token)) {
    throw new ServerError(ErrorType.ACCESS_DENIED);
  }

  validateInputFeilds(vacation);

  vacation.image = vacation.image.slice(
    hostUrl + ":3001/".length,
    vacation.image.length
  );

  await vacationsDao.updateVacation(vacation);
}

async function getFollowedVacationsList(token) {
  if (!isAdmin(token)) {
    throw new ServerError(ErrorType.ACCESS_DENIED);
  }

  let followedVacationsList = await vacationsDao.getFollowedVacationsList();
  return followedVacationsList;
}

module.exports = {
  getAllVacations,
  addVacation,
  deleteVacation,
  followVacation,
  unfollowVacation,
  updateVacation,
  getFollowedVacationsList,
  isAdmin
  
};
