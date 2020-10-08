const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'ejs');
// ===============================================
// ============ Database connection ==============
// ===============================================
// const mysql = require('mysql');
// const mysqlEndpoint = `css-capstone-db.cradnn53cnyz.us-west-2.rds.amazonaws.com`;
// const mySQLConnection = mysql.createConnection({
//     host: `${mysqlEndpoint}`
// ,   user: 'xxxx'
// ,   password: 'xxxxx'
// ,   database: 'css_capstone'
// });

// mySQLConnection.connect(async function(err) {
//     if (err) {
//         console.log(err);
//         throw err;
//     }
//     console.log("connected to db");
//     console.log()
    
//     // sample insert
//     // mySQLConnection.query('INSERT INTO people (name, age, address) VALUES (?, ?, ?)', ['Larry', '41', 'California, USA'], async function(error, result) {
//     //     if (error) {
//     //         console.log(error);
//     //         throw error;
//     //     }
//     //     console.log("1 record inserted");
//     // });
//     mySQLConnection.end();
// });
// end of database



app.get('/', (req,res) => {
    res.render('index.html');
});

app.get('/faq', (req, res) => {
    res.send('hello: faq')
});

app.get('/about', (req, res) => {
    res.send('hello: about');
});

// =============================
// Things may change============
// =============================

// =============================
// Basic Hotel Finder===========
// =============================

app.get('/hotel/search', (req, res) => {
    res.send('hello: main Search');
});

app.get('/hotel/search/:id', (req, res) => {
    res.send('hello: Search Hotel Detail');
});

app.get('/hotel/search/:id/book', (req, res) => {
    res.send('hello: Searched Hotel Booking');
});

app.get('/hotel/search/:id/book', (req, res) => {
    res.send('hello: Searched Hotel Booking Confirmation');
});

// =============================
// Register && Login============
// =============================
app.get('/login', (req, res) => {
    res.send('hello: Login page');
});

app.get('/register', (req, res) => {
    res.send('hello: Register page');
});


// =============================
// Basic Hotel CRUD=============
// =============================
app.get('/account', (req, res) => {
    res.send('hello: user account page where user sees there posts and make actions post, edit, and delete');
});

app.get('/account/new', (req, res) => {
    res.send('hello: Posting new Hotel');
});

app.get('/account/:id', (req, res) => {
    res.send('hello: detail of the user posted hotel');
});

app.get('/account/:id/edit', (req, res) => {
    res.send('hello: render edit page of posted hotel');
});

// put method after edit the hotel
app.put('/account/:id', (req, res) => {
    res.send('hello: I am the put page of after edit (save edited data happends here');
});

// redner delete hotel page
app.get('/account/:id/delete', (req, res) => {
    res.send('hello: I am deleting page for hotel');
})

// delete action method
app.delete('/account/', (req, res) => {
    res.send('hello: I am the action method after user clicked delete');
});

const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});