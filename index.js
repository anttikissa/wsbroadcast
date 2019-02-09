const ws = require('ws')

const port = Number(process.env.WSBROADCAST_PORT) || 7777

let server = new ws.Server({
    port
})

function log(...args) {
    console.log(...args)
}

// A room is an array of clients.
//
// Rooms is indexed by the path (such as '/' or '/room1') that the client used to connect to the
// websocket.
//
// The default path is '/'.
//
// Rooms are not cleaned up even after the last client disconnects.
let rooms = {}

function getRoom(path) {
    return rooms[path] || (rooms[path] = [])
}

let clientIdCounter = 0

server.on('connection', (client, req) => {
    client._id = clientIdCounter++

    let roomName = req.url

    log(`Client ${client._id} connected to ${roomName}`)

    let room = getRoom(roomName)

    room.push(client)

    client.on('message', (message) => {
        log(`${roomName} <${client._id}> ${message}`)
        for (let c of room) {
            if (c !== client) {
                c.send(message)
            }
        }
    })

    client.on('close', () => {
        log(`Client ${client._id} disconnected`)

        let clientIndex = room.indexOf(client)
        room.splice(clientIndex, 1)

        log(`Room ${roomName} has ${room.length} client(s) now`)
    })
})

