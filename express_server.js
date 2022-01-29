const express = require("express");
let cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const {generateRandomString, emailChecker, cookieHasUser, userUrls} = require ('./helpers');

//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['Hi'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//collector variable for urls, and users
const urlDatabase = {};
const users = {};

//logs which port is listening upon connection.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//shows Hello at local:port/
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//renders url_index.ejs to /urls
app.get("/urls", (req, res) => {
  const urls = userUrls(req.session.user_id, urlDatabase);
  const templateVars = {
    urls,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

//Random generate shortURL as JSON, and add it into urlDataBase
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID : req.session.user_id,
    };
    console.log(urlDatabase);
    res.redirect(`/urls`);
  } else {
    res.status(404).send("Please login before using this function");
  }
});

//renders urls_new.ejs to /urls/new
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

//renders url_show to /urls/${shortURL}
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('There are no longUrl corresponding with this shortUrl');
  }
});

//redirect to longURL, and 302 error is longURL is undefined.
app.get("/u/:shortURL", (req,res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;

    if (longURL === undefined) {
      res.status(302).send('site does not exist');
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send('There are no longUrl corresponding with this shortUrl');
  }
});


//deletes URL and redirect back to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const url = userUrls(id, urlDatabase);
  if (Object.keys(url).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send('Does not exist.');
  }
});

//changes longURL and redirect back to /urls
app.post("/urls/:id", (req,res) => {
  let id = req.session.user_id;
  let urls = userUrls(id, urlDatabase);
  if (Object.keys(urls).includes(req.params.id)) {
    let shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send('no urls');
  }
});

//login page
app.get('/login', (req,res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

//set a cookie for user when logged in.
app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!emailChecker(email, users)) {
    res.status(403).send("This email does not exist, please register!");
  } else {
    const newID = emailChecker(email, users);
    if (!bcrypt.compareSync(password, users[newID].password)) {
      res.status(403).send("Wrong password, please try again");
    } else {
      req.session.user_id = newID;
      res.redirect("/urls");
    }
  }
});

//clear cookie upon clicking logout
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

//website for registering
app.get("/register", (req,res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  }
});

//creating an account, check if email exist, check if missing email or password
app.post('/register', (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please enter a valid email and password");
    // console.log(users)
  } else if (emailChecker(email, users)) {
    res.status(400).send("OOPS! This email is not avaliable");
    // console.log(users)
  } else {
    let id = generateRandomString();
    users[id] = {
      id,
      email,
      password : bcrypt.hashSync(password, 10),
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});