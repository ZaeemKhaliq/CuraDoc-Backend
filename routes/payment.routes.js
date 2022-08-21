const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const ErrorHandler = require("../classes/ErrorHandler");

const stripe = Stripe(
  "sk_test_51JBJRDEKog3E8JbTfKo0A6WfsfcEnSB04wBu2ppNTEc1Ofe1aEylGQ61dsm4rSEvaz1ZfIuyz5k4k1ncn1fWqDK500LZGgsbwB",
  {
    apiVersion: "2020-08-27",
    typescript: false,
  }
);

router.post("/create-payment-intent", async (req, res) => {
  const { appointmentFee } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: appointmentFee,
      currency: "usd",
    });

    return res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return ErrorHandler.onCatchResponse({ res, error });
  }
});

module.exports = router;
