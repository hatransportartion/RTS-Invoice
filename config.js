const sftp = require("ssh2-sftp-client");

const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";
dotenv.config({ path: envFile });


const host = process.env.RTS_FTPS_HOST;
const port = process.env.RTS_FTPS_PORT;
const username = process.env.RTS_USERNAME;
const password = process.env.RTS_PASSWORD;

console.log("Host:", host);
console.log("Port:", port);
console.log("Username:", username);
console.log("Password:", password);

const sftpConfig = {
    host: host,
    port: port,
    username: username,
    password: password,
};


module.exports = sftpConfig;
