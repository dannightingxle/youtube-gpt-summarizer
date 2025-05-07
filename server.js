require("dotenv").config();
const summarizeApp = require("./functions/summarize");

summarizeApp.listen(3000, () => {
  console.log("Listening on port 3000");
});
