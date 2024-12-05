const path = require("path");
require("dotenv").config();
const express = require("express");
const app = express();

app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// MongoDB setup
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.qsmpv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const databaseAndCollection = {
    db: process.env.MONGO_DB_NAME,
    collection: process.env.MONGO_COLLECTION
};


// Start server
const port = process.argv[2] || 5000;
app.listen(port, () => {
    console.log(`Web server started and running at http://localhost:${port}`);
    console.log("Stop to shutdown the server: ");
});