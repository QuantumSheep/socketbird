const net = require('net');
const fs = require("fs");
const crypto = require('crypto');
const path = require('path');

const EventEmitter = require('events');

const SocketServer = require('./SocketServer');
const WebSocketConnection = require('./WebSocketConnection');
const SocketUtils = require('./SocketUtils');

class WebSocketServer extends EventEmitter {
    constructor() {
        super();

        /**
         * @type {{[id: string]: WebSocketConnection}}
         */
        this.clients = {};
        this.server = new SocketServer();

        this.server.server.addListener('connection', socket => {
            socket.on('data', data => {
                if (socket.writable && socket.readable) {
                    if (socket.id && this.clients[socket.id]) {
                        if (data[0] == 0x88) {
                            this.clients[socket.id].emit('close');
                        } else {
                            SocketUtils.decode(data, decoded => {
                                this.clients[socket.id].emit('data', decoded.toString());
                            });
                        }
                    } else if (data[0] == 0x47) {
                        const datastr = data.toString();

                        if (datastr.substring(0, 5).match(/GET/) && datastr.match(/WebSocket/)) {
                            const key = crypto.createHash("sha1").update(datastr.match(/Sec-WebSocket-Key: (.+)\r\n/)[1] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary').digest('base64');

                            const wssid = crypto.randomBytes(32).toString('hex');

                            socket.write(`HTTP/1.1 101 Switching Protocols\r\nSet-Cookie: wssid=${Buffer.from(wssid).toString('base64')}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${key}\r\n\r\n`);

                            socket.id = wssid;
                            this.socket = new WebSocketConnection(socket, datastr);

                            this.clients[socket.id] = this.socket;

                            this.emit('connection', this.socket);
                        }
                    }
                }
            });

            socket.on('close', hadError => {
                delete this.clients[socket.id];
            });

            socket.on('error', err => {
                console.log(err);
            });

            socket.on('timeout', () => {
                console.log('socket timeout');
                socket.end();
            });
        });
    }

    /**
     * Listen WebSocket to a specific port
     * 
     * @param {number} port 
     */
    listen(port) {
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

module.exports = WebSocketServer;