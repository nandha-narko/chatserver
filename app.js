var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res){
  res.send('Im a chat server');
});
io.on('connect', function(socket){
  console.log('user connected');
    socket.on('new_message', function(msg){
        console.log(msg);
        if(msg.socket) {
            socket.broadcast.to(msg.socket).emit('message_received', msg);
        }
        else {
            socket.broadcast.emit('message_received', msg);
        }
    });

    socket.on('new_user', function(data){
        socket.join(data.name);
        // console.log('user ' + data.name + ' on socket : ' + socket.id)
        data.socket = socket.id;
        socket.broadcast.emit('user_created',data);
    });

    socket.on('user_change', function(userName, oldUserName){
        socket.leave(oldUserName);
        socket.join(userName);
        socket.broadcast.emit('user_changed',userName, oldUserName);
    });

    socket.on('get_users', function(data) {
        var room_list = [];
        var rooms = io.sockets.adapter.rooms;
        for (var room in rooms){
            if (!rooms[room].sockets.hasOwnProperty(room)) {
                var userSocket = '';
                 for (var s in rooms[room].sockets){
                     userSocket = s;
                 }
                room_list.push({ name: room, socket: userSocket, notify:false });
            }
        }
        console.log(room_list);
        io.emit('users_list',room_list);
    })

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
const server = http.listen(process.env.PORT || 8081, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
});