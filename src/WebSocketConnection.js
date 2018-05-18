const {
    Socket
} = require('net');

class WebSocketConnection {
    /**
     * 
     * @param {Socket} socket 
     * @param {string} data 
     */
    constructor(socket, data) {
        this.socket = socket;

        /**
         * @type {{[key: string]: string}}
         */
        this.cookies = {};

        console.log(data);
    }

    /**
     * 
     * @param {string | symbol} event
     * @param {any[]} args 
     */
    emit(event, ...args) {
        this.socket.emit(event, ...args);
    }
}

module.exports = WebSocketConnection;