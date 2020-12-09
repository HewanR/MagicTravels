const express = require("express");

const usersLogic = require("../logic/users-logic");

const router = express.Router();

router.post("/login", async (request, response, next) => {
    let user = request.body;

    try {
        let successfulLoginData = await usersLogic.login(user);
        response.json(successfulLoginData);
    }
    
    catch (error) {
        return next(error);
    }
});

router.post("/google-login", async (request, response, next) => {

    let {tokenId} = request.body;
    
    try {
        let successfulLoginData = await usersLogic.googleLogin(tokenId);
        response.json(successfulLoginData);
    }
    catch (error) {
        return next(error);
    }
})

router.post("/register", async (request, response, next) => {

    let user = request.body;

    try {
        let successfulRegisterData = await usersLogic.addUser(user);      
        response.json(successfulRegisterData);
    }
    catch (error) {
        return next(error);
    }
});

router.get("/details", async (request, response, next) => {
    let token = request.headers.authorization;
    try {
        let successfulUserDetails = await usersLogic.getUserDetails(token);      
        response.json(successfulUserDetails);
    }
    catch (error) {
        return next(error);
    }

})

router.post("/logout", async (request, response, next) => {

    let token = request.headers.authorization;

    try {
        await usersLogic.deleteUserFromCache(token);      
        response.json();
    }
    catch (error) {
        return next(error);
    }
});


module.exports = router;