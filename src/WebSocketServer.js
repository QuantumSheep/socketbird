const net = require('net');
const fs = require("fs");
const crypto = require('crypto');

const SocketServer = require('./SocketServer');

class WebSocketServer extends SocketServer {
    constructor() {
        super(true);
        this.state = false;
        super.on('connection', socket => {
            socket.removeListener('data', () => {});

            socket.on('data', data => {
                data = data.toString();

                if (data.substring(0, 5).match(/GET/) && data.match(/WebSocket/)) {
                    const key = data.match(/Sec-WebSocket-Key: (.+)\r\n/)[1];

                    const genresp = crypto.createHash("sha1");
                    genresp.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');

                    const wssid = crypto.randomBytes(32).toString('base64');

                    socket.write(`HTTP/1.1 101 Switching Protocols\r\nSet-Cookie: wssid=${wssid}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${genresp.digest('base64')}\r\n\r\n`);

                    this.state = true;
                } else {
                    super.emit('data', data);
                }
            });

            socket.on('close', hadError => {

            });

            socket.on('error', err => {
                console.log(err);
            });
        });
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