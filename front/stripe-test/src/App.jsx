import { useState } from "react";
import axios from "axios";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Checkout from "./Checkout";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function App() {
  const [clientSecret, setClientSecret] = useState("");

  const createOrder = async () => {
    const res = await axios.post(
      "http://localhost:4000/api/orders",
      {
        paymentMethod: "stripe",
        shippingAddress: {
          fullName: "Asmaa",
          phone: "01000000000",
          country: "Egypt",
          city: "Beni Suef",
          address: "Street 1",
          postalCode: "62511",
        },
      },
      {
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTkzYjIxNmI5Y2Q3ZDZjOTMzOWNmNSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE3ODQyOTg0ODMsImV4cCI6MTc4Njg5MDQ4M30.CWOHE4DFp2hBxt7NrDt8ki5BXp4vn2JIEfAM8R151mY"
,
        },
      }
    );

    setClientSecret(res.data.data.clientSecret);
  };

  return (
    <>
      {!clientSecret ? (
        <button onClick={createOrder}>Create Order</button>
      ) : (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <Checkout />
        </Elements>
      )}
    </>
  );
}

export default App;