const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.SECRET_KEY;
  const API_URL = process.env.API_URL;

  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked,
  }).unless({
    path: [`${API_URL}/users/login`, `${API_URL}/users/register`],
  });
}

async function isRevoked(req, payload, done) {
  const { path } = req;

  const regEpxsToTestForAdmin = [
    /\/api\/v1\/users\/get.*/.test(path),
    /\/api\/v1\/roles\/get.*/.test(path),
    /\/api\/v1\/doctors\/verify-doctor.*/.test(path),
  ];

  if (regEpxsToTestForAdmin.includes(true)) {
    if (payload.role !== "Admin") {
      done(null, true);
    }
  }

  done();
}

module.exports = authJwt;
