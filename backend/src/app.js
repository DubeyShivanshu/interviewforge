const express = require('express');
const app = express();
const cors = require('cors');

//Import cookie-parser to parse cookies in requests
const cookieParser = require('cookie-parser');

//Enable CORS
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://interviewforge-5m9t.onrender.com" 
    ],
    credentials: true
}));

//Use express.json() middleware to parse JSON bodies in incoming requests
app.use(express.json());

//Use cookie-parser middleware to parse cookies in incoming requests
app.use(cookieParser());

//Require routes from auth.routes.js and interview.routes.js
const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');

//Use required routes with appropriate base paths
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;