const express = require("express");
let cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {
  let num = Math.random().toString(36).slice(7);
  return num.length === 6 ? num : generateRandomString();
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//shows Hello at local:port/
app.get("/", (req, res) => {
  res.send("Hello!");
});

//logs which port is listening upon connection.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//renders url_index.ejs to /urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username,
   };
  res.render("urls_index", templateVars);
});

//renders urls_new.ejs to /urls/new
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username : req.cookies.username,
  };
  res.render("urls_new", templateVars);
});


//renders url_show to /urls/${shortURL}
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username,
  };
  res.render("urls_show", templateVars);
});

//redirect to longURL, and 302 error is longURL is undefined.
app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];

  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});

//Random generate shortURL as JSON, and add it into urlDataBase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(req.body);  // Log the POST request body to the console, for checking
});

//deletes URL and redirect back to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//changes longURL and redirect back to /urls
app.post("/urls/:id", (req,res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

//set a cookie for user when logged in.
app.post("/login", (req,res) => {
  let username = req.body.username;
  res.cookie('username',username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});