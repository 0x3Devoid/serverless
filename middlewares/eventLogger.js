const { format } = require('date-fns');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;

const logger = async (message, logName) => {
    const eventDate = `${format(new Date(), 'yyyMMdd\tHH:mm:ss')}`;
    const logMessage = `${eventDate}\t${message}\n`;
    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(
            __dirname, '..', 'logs', logName), logMessage
        );
    } catch (error) {
        console.log(error);
    }
}

const requestLogger = async (req, res, next) => {
    logger(`${req.method}\t${req.headers.origin}\t${req.url}`, 'requestLogs.txt');
    console.log(`${req.method}\t${req.headers.origin}\t${req.url}`);
    next();
}

const errorLogger = (err, req, res, next) => {
    logger(`${err.name}:\t${err.message}`, 'errorLogs.txt');
    console.log(`${err.name}:\t${err.message}`);
    res.status(500).send(err.message);
}

module.exports = { requestLogger, errorLogger };
