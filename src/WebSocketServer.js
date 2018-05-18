const net = require('net');
const fs = require("fs");
const crypto = require('crypto');

const EventEmitter = require('events');

const SocketServer = require('./SocketServer');
const WebSocketConnection = require('./WebSocketConnection');

class WebSocketServer extends EventEmitter {
    constructor() {
        super();

        this.clients = {};
        this.server = new SocketServer();

        this.server.server.addListener('connection', socket => {
            socket.on('data', data => {
                const datastr = data.toString();

                if (datastr.substring(0, 5).match(/GET/) && datastr.match(/WebSocket/)) {
                    const key = crypto.createHash("sha1").update(datastr.match(/Sec-WebSocket-Key: (.+)\r\n/)[1] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary').digest('base64');

                    const wssid = crypto.randomBytes(32).toString('base64');

                    socket.write(`HTTP/1.1 101 Switching Protocols\r\nSet-Cookie: wssid=${wssid}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${key}\r\n\r\n`);

                    this.socket = new WebSocketConnection(socket, datastr);

                    console.log(socket);

                    this.clients[socket] = this.socket;
                } else {
                    let len = data[1] - 0x80;

                    if (len <= 125) {
                        const key = Buffer.from([data[2], data[3], data[4], data[5]]);
                        let decoded = Buffer.alloc(len);

                        for (let i = 0; i < len; i++) {
                            decoded[i] = data[6 + i] ^ key[i % 4];
                        }

                        data = decoded;
                    } else {
                        len = (data[2] << 8) + data[3];

                        const key = Buffer.from([data[4], data[5], data[6], data[7]]);

                        let decoded = Buffer.alloc(len);

                        for (let i = 0; i < len; i++) {
                            decoded[i] = data[8 + i] ^ key[i % 4];
                        }

                        data = decoded;
                    }
                }
            });

            socket.on('close', hadError => {

            });

            socket.on('error', err => {
                console.log(err);
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