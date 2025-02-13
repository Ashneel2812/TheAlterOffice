require('dotenv').config();  // Make sure dotenv is loaded before requiring the app
const dbURI = process.env.MONGO_URI;
console.log(dbURI);
const app = require('../app'); // Import the app module

// The server will start when running this file
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
