const express = require("express");
let cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');

// const password = "purple-monkey-dinosaur"; // found in the req.params object
// const hashedPassword = bcrypt.hashSync(password, 10);

//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//helper function for generating random id
const generateRandomString = () => {
  let num = Math.random().toString(36).slice(7);
  return num.length === 6 ? num : generateRandomString();
};

//helper function for email lookup
const emailchecker = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  } return false;
};

//specific users' url
const userUrls = (id) => {
  let personalUrl = {};
  for (let urlKey in urlDatabase) {
    if (urlDatabase[urlKey].userID === id) {
      personalUrl[urlKey] = urlDatabase[urlKey]
    }
  }
  return personalUrl;
}

const cookieHasUser = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
}

const urlDatabase = {
  // b6UTxQ: {
  //     longURL: "https://www.tsn.ca",
  //     userID: "userRandomID"
  // },
  // i3BoGr: {
  //     longURL: "https://www.google.ca",
  //     userID: "userRandomID"
  // }
};


const users = {
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // "user2RandomID": {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }
};


//shows Hello at local:port/
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//logs which port is listening upon connection.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//renders url_index.ejs to /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: userUrls(req.cookies.user_id),
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

//renders urls_new.ejs to /urls/new
app.get("/urls/new", (req, res) => {
  
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
  let templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
  }
});


//renders url_show to /urls/${shortURL}
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID,
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

//redirect to longURL, and 302 error is longURL is undefined.
app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL === undefined) {
    res.status(302).send('site does not exist');
  } else {
    res.redirect(longURL);
  }
});

//Random generate shortURL as JSON, and add it into urlDataBase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID : req.cookies.user_id,
  };
console.log(urlDatabase);
  res.redirect(`/urls`);
 
});

//deletes URL and redirect back to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.cookies.user_id;
  const url = userUrls(id);
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
  let id = req.cookies.user_id;
  let urls = userUrls(id);
  if(Object.keys(urls).includes(req.params.id)) {
    let shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send('no urls')
  }
});

//set a cookie for user when logged in.
app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!emailchecker(email)) {
    res.status(403).send("This email does not exist, please register!");
  } else {
    const newID = emailchecker(email);
    if (!bcrypt.compareSync(password, users[newID].password)) {
      res.status(403).send("Wrong password, please try again");
    } else {
      res.cookie('user_id', newID);
      res.redirect("/urls");
    }
  }
});

//login page
app.get ('/login', (req,res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_login", templateVars);
});


app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req,res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post('/register', (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please enter a valid email and password");
    // console.log(users)
  } else if (emailchecker(email)) {
    res.status(400).send( "OOPS! This email is not avaliable");
    // console.log(users)
  } else {
    let id = generateRandomString();
    users[id] = {
      id,
      email,
      password : bcrypt.hashSync(password, 10),
    };
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});