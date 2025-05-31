const mongoose = require('mongoose');
const uri = "mongodb://localhost:27017/fethAI"
//const uri = "mongodb+srv://jociemane:cLUk08bsFSokr023@cluster0.8h6jv.mongodb.net/fethAIy?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected successfully");
  console.log("Connected to database:", mongoose.connection.name);
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  console.error("Error details:", {
    name: err.name,
    message: err.message,
    code: err.code
  });
});
