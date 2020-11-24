const fs = require("fs");
const chalk = require("chalk");
const dotenv = require('dotenv');

function logger(req, res, next) {
    let current_datetime = new Date(Date.now());
    var ip = req.headers["x-forwarded-for"];
    if (ip){
      var list = ip.split(",");
      ip = list[list.length-1];
    } else {
      ip = req.connection.remoteAddress;
    }
    let formatted_date =
        "[ip : " + ip + "] " + 
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    let method = req.method;
    let url = req.url;
    let status = res.statusCode;

    const start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);

    let log = `[${chalk.blue(
      formatted_date
    )}] ${method}:${url} ${status} ${chalk.red(
      durationInMilliseconds.toLocaleString() + "ms"
    )}`;
    console.log(log);
    fs.appendFile("../req_logs.txt", log + "\n", err => {
      if (err) {
        console.log(err);
      }
    });
    next();
}

const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; // constant to convert to nanoseconds
    const NS_TO_MS = 1e6; // constant to convert to milliseconds
    const diff = process.hrtime(start);
  
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

module.exports = { logger }