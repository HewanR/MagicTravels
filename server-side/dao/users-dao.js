const ServerError = require("../errors/server-error");
const ErrorType = require("../errors/error-type");
const connection = require("./connection-wrapper");
const usersCache = require("../usersCache");

async function login(user) {
  let sql =
    "SELECT user_id as userId, first_name as firstName, last_name as lastName, user_name as userName, password, user_type as userType FROM users where user_name =? and password =?";

  let parameters = [user.userName, user.password];

  let userLoginResult;
  try {
    userLoginResult = await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
  }

  // A functional (!) issue which means - the userName + password do not match
  if (userLoginResult == null || userLoginResult.length == 0) {
    throw new ServerError(ErrorType.UNAUTHORIZED);
  }

  console.log("All good ! ");
  return userLoginResult[0];
}

async function googleLogin(email) {
  let sql =
    "SELECT user_id as userId, first_name as firstName, last_name as lastName, user_name as userName, password, user_type as userType FROM users where user_name =?";

  let parameters = [email];

  let userLoginResult;
  try {
    userLoginResult = await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
  }

  // A functional (!) issue which means - the userName + password do not match
  if (userLoginResult == null || userLoginResult.length == 0) {
    throw new ServerError(ErrorType.UNAUTHORIZED);
  }

  console.log("All good ! ");
  return userLoginResult[0];
}

async function getUserByUserName(userName) {
  let sql =
    "SELECT user_id as userId, first_name as firstName, last_name as lastName, user_name as userName, password, user_type as userType FROM users where user_name =?";
  let parameters = [userName];
  let userLoginResult;

  try {
    userLoginResult = await connection.executeWithParameters(sql, parameters);
    return userLoginResult;
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
  }
}

async function isUserExistByUserName(userName) {
  let userLoginResult = await getUserByUserName(userName);

  if (userLoginResult == null || userLoginResult.length == 0) {
    return false;
  }
  return true;
}

async function addUser(user) {
  let sql =
    "INSERT INTO users (first_name, last_name, user_name, password)  values(?, ?, ?, ?)";
  let parameters = [
    user.firstName,
    user.lastName,
    user.userName,
    user.password,
  ];

  try {
    let response = await connection.executeWithParameters(sql, parameters);

    let newUser = {
      userId: response.insertId,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      password: user.password,
      userType: "Customer",
    };
    return newUser;
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
  }
}

let saveDataForCache = (token, userData) => {
  usersCache.saveDataForCache(token, userData);
};

function getUserDetails(token) {
  let userDetails = usersCache.getUserDetails(token);
  let userFilteredData = {
    userId: userDetails.userId,
    userType: userDetails.userType,
  };
  return userFilteredData;
}

function deleteUserFromCache(token) {
  usersCache.deleteUserFromCache(token);
}

module.exports = {
  login,
  googleLogin,
  addUser,
  isUserExistByUserName,
  saveDataForCache,
  getUserDetails,
  deleteUserFromCache,
};
