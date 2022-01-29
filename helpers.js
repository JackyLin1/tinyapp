//helper function for generating random id
const generateRandomString = () => {
  let num = Math.random().toString(36).slice(7);
  return num.length === 6 ? num : generateRandomString();
};

//helper function for email lookup
const emailChecker = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return users[user].id;
    }
  } return false;
};

//specific users' url
const userUrls = (id) => {
  let personalUrl = {};
  for (let urlKey in urlDatabase) {
    if (urlDatabase[urlKey].userID === id) {
      personalUrl[urlKey] = urlDatabase[urlKey];
    }
  }
  return personalUrl;
};

//check if user exist in cookie
const cookieHasUser = function(cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};


module.exports = {generateRandomString, emailChecker, userUrls, cookieHasUser};