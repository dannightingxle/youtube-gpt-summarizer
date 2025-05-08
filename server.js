const summarizeApp = require("./functions/summarize");
const PORT = process.env.PORT || 3000;

summarizeApp.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));