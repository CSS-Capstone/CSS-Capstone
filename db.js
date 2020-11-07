const mysql = require("mysql");
const dotenv = require('dotenv');

// ===============================================
// ============ Database CONFIG ==============
// ===============================================
dotenv.config({ path: './.env' });
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// ===============================================
// ============= Database Connction ==============
// ===============================================
db.connect((error) => {
    if (!error) {
        console.log("Database is Successfully Connected");
    } else {
        console.log("DB connection Failed");
    }
});

module.exports = db;
