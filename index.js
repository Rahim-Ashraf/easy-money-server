const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;
const app = express();

// middlewars
app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
        ],
        credentials: true,
    })
);

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster2.n2vc9uo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const easyMoney = client.db("easyMoney");
        const usersCollection = easyMoney.collection("users");
        const balanceCollection = easyMoney.collection("balance");

        // JWT APIs
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
            res.send({ token });
        })

        app.get("/users", async (req, res) => {
            const resust = await usersCollection.find().toArray();
            res.send(resust);
        })
        app.post("/users", async (req, res) => {
            const user = req.body;
            const cursor = await usersCollection.insertOne(user);
            res.send(cursor);
        })
        app.get("/balance", async (req, res) => {
            const userId = req.query.userId;
            const query = { userId: userId }
            const resust = balanceCollection.findOne(query);
            res.send(resust);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Easy Money is running")
})
app.listen(port, () => {
    console.log(`Easy Money running at: http://localhost:${port}`)
})