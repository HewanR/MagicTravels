const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const config = require('../config.json');
const usersDao = require("../dao/users-dao");
const ServerError = require("../errors/server-error");
const ErrorType = require("../errors/error-type");

const GoogleClient = new OAuth2Client("357689223091-bfceio0tfcbvtoqvk5ac32ctbi7scdnh.apps.googleusercontent.com");

const saltRight = "sdkjfhdskajh";
const saltLeft = "--mnlcfs;@!$ ";


let createHashPassword = (password) => {
    password = crypto.createHash("md5").update(saltLeft + password + saltRight).digest("hex");
    return password;
}

let generateToken = (userData) => {
    const token = jwt.sign({ sub: userData.userName }, config.secret);
    return token;
}

let createSuccessfullLoginResponse = (token, userData) => {
    let successfullLoginResponse = { token: token, userType: userData.userType, userName: userData.firstName };
    return successfullLoginResponse;
}

let validateInputFeilds = (user) => {
    //validations
    if (user.firstName.trim() === "" || user.lastName.trim() === "" || user.userName.trim() === "" || user.password.trim() === "") {
        ErrorType.INVALID_INPUT_FEILD.message = "All fields must be filled!";
        throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
    }

    if (user.firstName.length > 20 || user.lastName.length > 20 || user.userName.length > 20 || user.password.length > 20) {
        ErrorType.INVALID_INPUT_FEILD.message = "Fields can include max 20 characters";
        throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
    }

    if (user.password.length < 6) {
        ErrorType.INVALID_INPUT_FEILD.message = "Password must include at least 6 characters";
        throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
    }
}

async function login(user) {

    if (user.userName.trim() === "" || user.password.trim() === "") {
        ErrorType.INVALID_INPUT_FEILD.message = "All fields must be filled!";
        throw new ServerError(ErrorType.INVALID_INPUT_FEILD);
    }

    user.password = createHashPassword(user.password);

    let userLoginData = await usersDao.login(user);
    let token = generateToken(userLoginData);

    usersDao.saveDataForCache(token, userLoginData);

    let successfulLoginResponse = createSuccessfullLoginResponse(token, userLoginData);
    return successfulLoginResponse;

}

async function googleLogin(tokenId) {
    let response = await GoogleClient.verifyIdToken({ idToken: tokenId, audience: "357689223091-bfceio0tfcbvtoqvk5ac32ctbi7scdnh.apps.googleusercontent.com" })

    const { email_verified, given_name, family_name, email } = response.payload;

    if (email_verified) {
        let googleUserLoginData;
        if (await usersDao.isUserExistByUserName(email)) {
            googleUserLoginData = await usersDao.googleLogin(email);

        } else {
            let password = createHashPassword(email);
            let user = {
                firstName: given_name,
                lastName: family_name,
                userName: email,
                password: password
            }
            googleUserLoginData = await usersDao.addUser(user);
        }
        let token = generateToken(googleUserLoginData);

        usersDao.saveDataForCache(token, googleUserLoginData);
        let successfulLoginResponse = createSuccessfullLoginResponse(token, googleUserLoginData);
        return successfulLoginResponse;
    } else {
        throw new ServerError(ErrorType.UNAUTHORIZED);
    }

}

async function addUser(user) {
    validateInputFeilds(user);

    if (await usersDao.isUserExistByUserName(user.userName)) {
        throw new ServerError(ErrorType.USER_NAME_ALREADY_EXIST);
    }

    user.password = createHashPassword(user.password);
    let userRegisterData = await usersDao.addUser(user);

    let token = generateToken(userRegisterData);

    usersDao.saveDataForCache(token, userRegisterData);

    let successfulLoginResponse = createSuccessfullLoginResponse(token, userRegisterData);
    return successfulLoginResponse;

}

function getUserDetails(token) {
    let pureToken = token.split(" ").pop();

    let userFilteredData = usersDao.getUserDetails(pureToken);
    return userFilteredData;

}


function deleteUserFromCache(token) {
    let pureToken = token.split(" ").pop();

    usersDao.deleteUserFromCache(pureToken);

}

module.exports = {
    login,
    googleLogin,
    addUser,
    getUserDetails,
    deleteUserFromCache
};