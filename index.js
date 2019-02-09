const ws = require('ws')

const port = Number(process.env.WSBROADCAST_PORT) || 7777

let server = new ws.Server({
    port
})

function log(...args) {
    console.log(...args)
}

let clients = []

let clientIdCounter = 0

server.on('connection', (client) => {
    client._id = clientIdCounter++

    log(`Client ${client._id} connected`)

    clients.push(client)

    client.on('message', (message) => {
        log(`<${client._id}> ${message}`)
        for (let c of clients) {
            if (c !== client) {
                c.send(message)
            }
        }
    })

    client.on('close', () => {
        log(`Client ${client._id} disconnected`)

        let clientIndex = clients.indexOf(client)
        clients.splice(clientIndex, 1)

        log(`I have ${clients.length} client(s) now`)
    })
})

