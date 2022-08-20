const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = Stripe(
  "sk_test_51JBJRDEKog3E8JbTfKo0A6WfsfcEnSB04wBu2ppNTEc1Ofe1aEylGQ61dsm4rSEvaz1ZfIuyz5k4k1ncn1fWqDK500LZGgsbwB",
  {
    apiVersion: "2020-08-27",
    typescript: false,
  }
);

router.post("/create-payment-intent", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 5000,
    currency: "usd",
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

module.exports = router;
