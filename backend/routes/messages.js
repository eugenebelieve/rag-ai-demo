const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const { config } = require("dotenv");
config();

router.use(express.json());

const { RagFunction } = require("./RagFunction.js");

/******** CONSTANTS ********/
const atlas_uri = process.env.MONGODB_ATLAS_URI;
const database_name = "retail";
const collection_name = "messages";

const client = new MongoClient(atlas_uri);

/** -------------- GET ALL MESSAGES ROUTE -------------- **/
router.get("/messages", async (req, res) => {
  try {
    await client.connect();

    const db = client.db(database_name);
    const collection = db.collection(collection_name);
    const findResult = await collection.find({}).limit(30).toArray();

    console.log(findResult);
    res.send(findResult);
  } catch (err) {
    console.log("err -> " + err);
  }
});

/** -------------- RAG ROUTE -------------- **/
router.post("/rag", async (req, res) => {
  const result = await RagFunction(req.body.message, req.body.selected);
  return res.send(result);
});

/** -------------- INSERT MESSAGE TO DB -------------- **/
router.post("/send", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(database_name);
    const collection = db.collection(collection_name);

    // INSERT PAYLOAD
    let result = await collection.insertOne(req.body);

    if (result) return res.send(result);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = router;
