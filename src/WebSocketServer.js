const net = require('net');
const fs = require("fs");
const crypto = require('crypto');
const path = require('path');

const {
    Server
} = require('http');

const EventEmitter = require('events');

const SocketServer = require('./SocketServer');
const WebSocketConnection = require('./WebSocketConnection');

class WebSocketServer extends EventEmitter {
    /**
     * 
     * @param {Server} http 
     */
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
                        let len = data[1] - 0x80;

                        if (len <= 125) {
                            const key = Buffer.from([data[2], data[3], data[4], data[5]]);
                            let decoded = Buffer.alloc(len);

                            for (let i = 0; i < len; i++) {
                                decoded[i] = data[6 + i] ^ key[i % 4];
                            }

                            this.clients[socket.id].emit('data', decoded.toString());
                        } else {
                            len = (data[2] << 8) + data[3];

                            const key = Buffer.from([data[4], data[5], data[6], data[7]]);

                            let decoded = Buffer.alloc(len);

                            for (let i = 0; i < len; i++) {
                                decoded[i] = data[8 + i] ^ key[i % 4];
                            }

                            this.clients[socket.id].emit('data', decoded.toString());
                        }
                    } else {
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