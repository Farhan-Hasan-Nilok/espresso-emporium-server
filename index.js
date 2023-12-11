const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();

//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kqr4p9m.mongodb.net/?retryWrites=true&w=majority`;

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
        const database = client.db("coffeeDB");
        const coffeeCollection = database.collection("espresso");

        app.get('/display-coffee', async(req, res) => {
            const getCoffee = coffeeCollection.find();
            const allCoffee = await getCoffee.toArray();
            res.send(allCoffee);
        });

        app.get('/display-coffee/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/add-coffee', async(req, res) => {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result)
        })

        app.delete('/delete-coffee/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/edit-coffee/:id', async(req, res) => {
            const editedCoffee = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id)};
            const options = { upsert: true}; //optional field
            const updateCoffee = {
                $set:{
                    name: editedCoffee.name,
                    chefName: editedCoffee.chefName,
                    supplier: editedCoffee.supplier,
                    price: editedCoffee.price,
                    taste: editedCoffee.taste,
                    details: editedCoffee.details,
                    photo: editedCoffee.photo 
                }
            };

            const result = await coffeeCollection.updateOne(filter, updateCoffee, options);
            res.send(result);
        }); 

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Espresso Emporium server is running");
})

app.listen(port, (req, res) => {
    console.log(`Server is running on port: ${port}`);
})