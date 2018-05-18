const net = require('net');

const EventEmitter = require('events');

class SocketServer extends EventEmitter {
    constructor(isws = false) {
        super();

        this.clients = [];
        this.emmiter = new EventEmitter();

        this.server = net.createServer(socket => {
            socket.setTimeout(0);
            socket.setNoDelay();

            this.emit('connection', socket);
        });
    }

    /**
     * Listen the sockets to a specific port
     * 
     * @param {number} port 
     */
    listen(port) {
        this.port = port;

        this.server.listen(port);
    }

    /**
     * Listen to an event
     * 
     * @param {string | symbol} type 
     * @param {(...args: any[]) => void} listener
     */
    on(type, listener) {
        return super.addListener(type, listener);
    }
}

module.exports = SocketServer;