const connection = require("./connection-wrapper");
const ErrorType = require("./../errors/error-type");
const ServerError = require("./../errors/server-error");
const usersCache = require("../usersCache");

async function getAllVacations(userId) {
    let vacationsListResult;

    let sql = `SELECT  v.vacation_id as vacationId, v.destination, v.description, v.image, DATE_FORMAT(v.start_date, '%d/%m/%Y') AS startDate, DATE_FORMAT(v.end_date,'%d/%m/%Y') AS endDate, v.price,  followed_vacations.user_id AS userId, 
    (SELECT COUNT(*) FROM followed_vacations 
    WHERE vacation_id = v.vacation_id) AS numOfFollowers 
    FROM vacations v 
    LEFT JOIN followed_vacations  ON v.vacation_id=followed_vacations.vacation_id && followed_vacations.user_id=? 
    ORDER BY  followed_vacations.user_id DESC`;
    let parameters = [userId];

    try {
        vacationsListResult = await connection.executeWithParameters(sql, parameters);
    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
    }


    if (vacationsListResult == null || vacationsListResult.length == 0) {
        throw new ServerError(ErrorType.NO_VACATIONS_DATA);
    }

    return vacationsListResult;
}

async function addVacation(vacation) {
    let sql = "INSERT INTO vacations (image, destination, price, description, start_date , end_date) values(?, ?, ?, ?, ? ,?)";
    let parameters = [vacation.image, vacation.destination, vacation.price, vacation.description, vacation.startDate, vacation.endDate];

    try {
        let response = await connection.executeWithParameters(sql, parameters);

        let newVacation = {
            vacationId: response.insertId,
            image: vacation.image,
            destination: vacation.destination,
            price: vacation.price,
            description: vacation.description,
            startDate: vacation.startDate,
            endDate: vacation.endDate,
            isFollowed: false,
            numOfFollowers: 0
        }

        return newVacation;

    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
    }

}

async function getImageForDelete(vacationId){
    let sql = `SELECT image FROM vacations WHERE vacation_id =?;`
    let parameters = [vacationId]

    try {
        let imageForDelete = await connection.executeWithParameters(sql, parameters);
        return imageForDelete[0].image;
    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error)
    }
}


async function deleteVacation(vacationId) {
    let sql = `DELETE FROM followed_vacations WHERE vacation_id=?;
            DELETE FROM vacations WHERE vacation_id=?`;
    let parameters = [vacationId, vacationId];

    try {
       await connection.executeWithParameters(sql, parameters);
      
    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
    }

}

async function followVacation(vacationId, userId) {
    let sql = "INSERT INTO followed_vacations (user_id, vacation_id) values(?, ?)";
    let parameters = [userId, vacationId];

    try {
        await connection.executeWithParameters(sql, parameters);

    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);

    }
}

async function unfollowVacation(vacationId, userId) {
    let sql = "DELETE FROM followed_vacations where user_id =? and vacation_id=?";
    let parameters = [userId, vacationId];

    try {
        await connection.executeWithParameters(sql, parameters);

    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);

    }
}

async function updateVacation(vacation) {
    let sql = "UPDATE vacations SET image = ?, destination = ?, price = ?, description = ?, start_date = ? , end_date = ? WHERE vacation_id = ?";
    let parameters = [vacation.image, vacation.destination, vacation.price, vacation.description, vacation.startDate, vacation.endDate, vacation.vacationId];

    try {
        await connection.executeWithParameters(sql, parameters);

    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);
    }

}

async function getFollowedVacationsList() {
    let followedVacationsListResult;
    let sql = `SELECT f.vacation_id AS vacationId, COUNT(*) AS numOfFollowers, v.destination
                FROM followed_vacations f
                LEFT JOIN vacations v
                ON v.vacation_id = f.vacation_id
                GROUP BY vacationId
                HAVING COUNT(*)>=1`;

    try {
        followedVacationsListResult = await connection.execute(sql);

    }
    catch (error) {
        throw new ServerError(ErrorType.GENERAL_ERROR, sql, error);

    }

    if (followedVacationsListResult == null || followedVacationsListResult.length == 0) {
        throw new ServerError(ErrorType.NO_FOLLOWERS);

    }

    return followedVacationsListResult;

}

function getUserDetails(token) {
    let userDetails = usersCache.getUserDetails(token);
    return userDetails;
}


module.exports = {
    getAllVacations,
    addVacation,
    deleteVacation,
    getImageForDelete,
    followVacation,
    unfollowVacation,
    updateVacation,
    getFollowedVacationsList,
    getUserDetails
};