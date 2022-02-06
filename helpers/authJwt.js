const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.SECRET_KEY;
  const API_URL = process.env.API_URL;

  return expressJwt({
    secret,
    algorithms: ["HS256"],
  }).unless({
    path: [`${API_URL}/users/login`, `${API_URL}/users/register`],
  });
}

module.exports = authJwt;
