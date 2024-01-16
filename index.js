const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middlewares

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rvhbtde.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("myDB");
    const coffeeCollection = database.collection("coffeeCollection");

    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/updateCoffee/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await coffeeCollection.findOne(query);
        res.send(result);

    });
    app.put("/updateCoffee/:id",async(req,res)=>{
      const id = req.params.id;
      const updatedCoffee = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTheCoffee = {
        $set: {
          name : updatedCoffee.name,
          quantity : updatedCoffee.quantity,
          supplier : updatedCoffee.supplier,
          taste : updatedCoffee.taste,
          category : updatedCoffee.category,
          details : updatedCoffee.details,
          photo : updatedCoffee.photo,
          
        },
      };
      const result = await coffeeCollection.updateOne(filter, updateTheCoffee, options);
      res.send(result);
    

    })
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);

      const result = await coffeeCollection.insertOne(newCoffee);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(result);
    });
    

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id:new ObjectId(id)};
      const result = await coffeeCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("coffee making server is running");
});
app.listen(port, () => {
  console.log(`server is running on port :  ${port}`);
});
