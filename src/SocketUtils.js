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
        } else if (data_buf.length >= 126 && data_buf.length <= 65535) {
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
     * @param {(encoded: string) => void} cb 
     */
    static encode(data, cb = (encoded) => {}) {
        const data_buf = Buffer.from(data);
        let offset = 0;

        if (data_buf.length <= 125) {
            offset = 6;
        } else if (data_buf.length >= 126 && data_buf.length <= 65535) {
            offset = 8;
        } else {
            offset = 14;
        }

        const target = Buffer.allocUnsafe(data_buf.length + offset);

        if (offset == 6) {
            target[1] = data_buf.length | 0x80;
        } else if (offset == 8) {
            target[1] = 0xfe;
            target[2] = (data_buf.length >> 8);
            target[3] = (data_buf.length);
        } else {
            target[1] = 0xfe;
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

        const key = crypto.randomBytes(4);

        target[offset - 4] = key[0];
        target[offset - 3] = key[1];
        target[offset - 2] = key[2];
        target[offset - 1] = key[3];

        for (let i = 0; i < data_buf.length; i++) {
            target[offset + i] = data_buf[i] ^ key[i % 4];
        }

        cb(target);
    }
}

module.exports = SocketUtils;