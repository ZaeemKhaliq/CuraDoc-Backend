const express = require("express");
require("dotenv/config");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const authJwt = require("./helpers/authJwt");
const errorHandler = require("./helpers/errorHandler");

//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);

//ROUTES
app.get("/", (req, res) => {
  res.send("WELCOME TO CURADOC BACKEND!");
});

const patientRoutes = require("./routes/patient.routes");
const doctorRoutes = require("./routes/doctor.routes");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const messagesRoutes = require("./routes/messages.routes");

const API_URL = process.env.API_URL;

app.use(`${API_URL}/patients`, patientRoutes);
app.use(`${API_URL}/doctors`, doctorRoutes);
app.use(`${API_URL}/users`, userRoutes);
app.use(`${API_URL}/roles`, roleRoutes);
app.use(`${API_URL}/appointments`, appointmentRoutes);
app.use(`${API_URL}/messages`, messagesRoutes);

//PORT LISTENING
const PORT = process.env.PORT || 8000;
const DOMAIN_NAME = process.env.DOMAIN_NAME;

app.listen(PORT, () => {
  console.log(`Server is listening at: http://${DOMAIN_NAME}:${PORT}`);
});

//DATABASE CONNECTION
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection to database successful!");
  })
  .catch((err) => {
    console.log(
      "An error occurred while establishing connection to database: ",
      err
    );
  });
