let ErrorType = {
    GENERAL_ERROR : {id: 1, httpCode: 600, message : "Oops, Something went wrong, Please try again later", isShowStackTrace: true},
    USER_NAME_ALREADY_EXIST : {id: 2, httpCode: 601, message : "User name already exist", isShowStackTrace: false},
    UNAUTHORIZED : {id: 3, httpCode: 401, message : "Login failed, invalid user name or password", isShowStackTrace: false},
    NO_VACATIONS_DATA : {id: 4, httpCode: 500, message : "Covid-19 is here, #127925& אין יותר מועדונים", isShowStackTrace: true},
    NO_FOLLOWERS : {id: 5, httpCode: 410, message : "There are no followers to any vacation", isShowStackTrace: false},
    INVALID_TOKEN : {id: 6, httpCode: 403, message : "Oops, Something went wrong, try re-logging", isShowStackTrace: false},
    INVALID_INPUT_FEILD : {id: 7, httpCode: 400, message : "Invalid input", isShowStackTrace: false},
    ACCESS_DENIED : {id: 8, httpCode: 401, message : "You are unauthorized to that action", isShowStackTrace: false}
}

module.exports = ErrorType;