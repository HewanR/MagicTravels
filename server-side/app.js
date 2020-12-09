const express = require('express');
const cors = require('cors');

const usersController = require("./controllers/users-controller");
const vacationsController = require("./controllers/vacations-controller");
const loginFilter = require('./middlewares/login-filter');
const errorHandler = require("./errors/error-handler");
const ServerError = require("./errors/server-error");
const ErrorType = require("./errors/error-type");
const handleSocketsIo = require("./soketIo-handler");

const hostUrl = "http://localhost";

const server = express();

server.use(express.static(__dirname));
server.use(express.static('./uploads'));

handleSocketsIo(server);

server.use(cors({ origin: hostUrl + ":3000", credentials: true }));

server.use(express.json());

server.use(loginFilter());

server.use(function (err, req, res, next) {
    if (401 === err.status) {
        throw new ServerError(ErrorType.INVALID_TOKEN);
    }
});

server.use("/users", usersController);
server.use("/vacations", vacationsController);



server.use(errorHandler);



const port = process.env.PORT || 3001;
server.listen(port, () => console.log('Server started on port ' + port));





