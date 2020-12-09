const usersLogic = require("./logic/users-logic");

function handleSocketsIo(server) {
    const http = require('http').createServer(server);
    const io = require('socket.io')(http);
    const socketIOCache = require('./socketIOCache');

    io.on('connection', (socket) => {
        let userId = getUserId(socket);

        socketIOCache.set(userId, socket);
        console.log("userId " + userId + " has been connected... Total clients: " + socketIOCache.size);

        socket.on('add-vacation', (newVacation) => {
            socket.broadcast.emit('add-vacation', newVacation);
        });
        socket.on('edit-vacation', (vacation) => {
            socket.broadcast.emit('edit-vacation', vacation);
        });
        socket.on('delete-vacation', (vacation) => {
            socket.broadcast.emit('delete-vacation', vacation);
        });
        socket.on('follow-vacation', (vacation) => {
            socket.broadcast.emit('follow-vacation', vacation);
        });
        socket.on('unfollow-vacation', (vacation) => {
            socket.broadcast.emit('unfollow-vacation', vacation);
        });

        socket.on('disconnect', () => {
            socketIOCache.delete(userId);
            console.log("userId " + userId + " has been disconnected. Total clients: " + socketIOCache.size);
        })
    })

    http.listen(3002, () => {
        console.log('Socket.IO is listening on port 3002');
    })
}

function getUserId(socket) {
    let handshakeData = socket.request;
    let userToken = handshakeData._query['token'];

    let userDetails = usersLogic.getUserDetails(userToken);
    let userId = userDetails.userId;
    return userId;
}


module.exports = handleSocketsIo;
