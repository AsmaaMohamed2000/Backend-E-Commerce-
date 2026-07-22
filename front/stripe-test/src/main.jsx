import { loadStripe } from "@stripe/stripe-js";
// publish key from developer api keys 
const stripePromise = loadStripe(
  "pk_test_51TZep4J5pfNk8Lyf4FEvsiR22z6wptUEjODBGaPsB9fJ0NNoJuYSzMn5pu8wlm3zAaDyBOwPcabEIwcaqWHNVAkA00bkoY0g8E"
);


import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);