const crypto = require('crypto');

class SocketUtils {
    /**
     * Decode WebSocket Buffer
     * 
     * @param {Buffer} data 
     * @param {(decoded: string) => void} cb 
     */
    static decode(data, cb = (decoded) => {}) {
        let len = data[1] - 0x80;

        if (len <= 125) {
            const key = Buffer.from([data[2], data[3], data[4], data[5]]);
            const decoded = Buffer.alloc(len);

            for (let i = 0; i < len; i++) {
                decoded[i] = data[6 + i] ^ key[i % 4];
            }

            cb(decoded.toString());
        } else if (data.length >= 126 && data.length <= 65535) {
            len = (data[2] << 8) + data[3];

            const key = Buffer.from([data[4], data[5], data[6], data[7]]);

            const decoded = Buffer.alloc(len);

            for (let i = 0; i < len; i++) {
                decoded[i] = data[8 + i] ^ key[i % 4];
            }

            cb(decoded);
        } else {
            len = (data[2] << 8) + (data[3] << 4) + (data[4] << 4) + (data[5] << 8) + (data[6] << 8) + (data[7] << 8) + (data[8] << 8) + data[9];

            const key = Buffer.from([data[10], data[11], data[12], data[13]]);

            const decoded = Buffer.alloc(len);

            for (let i = 0; i < len; i++) {
                decoded[i] = data[14 + i] ^ key[i % 4];
            }

            cb(decoded);
        }
    }

    /**
     * Encode WebSocket Buffer
     * 
     * @param {string} data 
     * @param {(encoded: Buffer) => void} cb 
     */
    static encode(data, cb = (encoded) => {}) {
        const data_buf = Buffer.from(data);
        let offset = 0;

        if (data_buf.length <= 125) {
            offset = 2;
        } else if (data_buf.length >= 126 && data_buf.length <= 65535) {
            offset = 4;
        } else {
            offset = 10;
        }

        const target = Buffer.allocUnsafe(data_buf.length + offset);

        if (offset == 2) {
            target[1] = data_buf.length;
        } else if (offset == 4) {
            target[1] = 126;
            target[2] = (data_buf.length >> 8);
            target[3] = (data_buf.length);
        } else {
            target[1] = 127;
            target[2] = (data_buf.length >> 56);
            target[3] = (data_buf.length >> 48);
            target[4] = (data_buf.length >> 40);
            target[5] = (data_buf.length >> 32);
            target[6] = (data_buf.length >> 24);
            target[7] = (data_buf.length >> 16);
            target[8] = (data_buf.length >> 8);
            target[9] = (data_buf.length);
        }

        target[0] = 0x81;

        for (let i = 0; i < data_buf.length; i++) {
            target[offset + i] = data_buf[i];
        }

        cb(target);
    }
}

module.exports = SocketUtils;