const { assert } = require('chai');

const {generateRandomString, emailChecker, cookieHasUser, userUrls} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};


describe('emailChecker', function() {
  it('should return a user with valid email', function() {
    const user = emailChecker("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });
  
  it('non-existent email returns undefined', function() {
    const user = emailChecker('undefine@undefine.com', testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });

});

describe('generateRandomString', function() {
  it('returns unique string each time', function() {
    const random = generateRandomString();
    const expectedvalue = generateRandomString();
    // Write your assert statement here
    assert.notEqual(random, expectedvalue);
  });
});

describe('cookieHasUser', function() {
  it('return true if cookie matches user in the database', function() {
    const userCookie = cookieHasUser('userRandomID', testUsers);
    const expectedUserID = true;
    // Write your assert statement here
    assert.equal(userCookie, expectedUserID);
  });
});

describe('userUrls', function() {
  it('return url information for that user ID', function() {
    const perasonalUrl = userUrls("userRandomID", urlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID"
      }
    };
    // Write your assert statement here
    assert.deepEqual(perasonalUrl, expectedOutput);
  });
});
