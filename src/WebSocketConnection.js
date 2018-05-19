const {
    Socket
} = require('net');
const crypto = require('crypto');
const EventEmitter = require('events');

class WebSocketConnection extends EventEmitter {
    /**
     * 
     * @param {Socket} socket 
     * @param {string} headers 
     */
    constructor(socket, headers) {
        super();

        this.socket = socket;

        this.handshake = {
            /**
             * @type {{[x: string]: string}}
             */
            headers: {},

            /**
             * @type {{[x: string]: string}}
             */
            cookies: {}
        };

        headers.split('\r\n').slice(1).filter(header => {
            return header;
        }).forEach(header => {
            const header_parts = header.split(': ');

            this.handshake.headers[header_parts[0]] = header_parts[1];
        });

        if (this.handshake.headers['Cookie']) {
            this.handshake.headers['Cookie'].split('; ').forEach(cookie => {
                const cookie_parts = cookie.split('=');

                this.handshake.cookies[cookie_parts[0]] = cookie_parts[1];
            });
        }
    }

    send(data) {
        this.socket.write(Buffer.from(data));
    }
}

module.exports = WebSocketConnection;