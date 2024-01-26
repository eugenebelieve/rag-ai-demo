const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

/** ROUTES */
const messages = require("./routes/messages");

app.use("/api/", messages);

/** PORT CONSTANT */
const port = 8000; //process.env.PORT ||

/** PORT LISTENER */
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
