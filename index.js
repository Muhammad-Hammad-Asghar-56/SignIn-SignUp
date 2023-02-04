const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12595800',
  password: 'Dj3NCUtlhG',
  database: 'sql12595800'
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

connection.query(`
  CREATE TABLE IF NOT EXISTS users (
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
  );
`, function (error, results, fields) {
  if (error) throw error;
  console.log("Table created successfully!");
});


app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signInPage.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signUpPage.html'));
});

app.post('/signup', function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  connection.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], function (err, results, fields) {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.error('Error: Duplicate entry');
        res.send("Email Exists")
      } else {
        res.send("An error occured. Try again")
        console.error(err);
      }
    } else {
      res.send("Welcome " + name)
      console.log('Data inserted successfully');
    }
  })
});

app.post('/signin', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  connection.query("SELECT * FROM users WHERE email = ?", [email], function (err, results, fields) {
    if (err) throw err;
    if (results.length > 0) {
      if (results[0].password === password) {
        console.log("Sign in successful!");
        res.send("Welcome " + results[0].name);
      } else {
        console.log("Incorrect password!");
        res.send("Incorrect password!");
      }
    } else {
      console.log("Email not found!");
      res.send("Email not found!");
    }
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
