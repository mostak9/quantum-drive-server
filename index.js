const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.6nmlwzx.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const productCollection = client.db('clientDB').collection('products');
    const cartCollection = client.db('clientDB').collection('cart');
    app.post('/products', async  (req, res) =>  {
      const product = req.body;
      const result = await  productCollection.insertOne(product);
      res.send(result);
    })

    app.get('/products', async(req, res)  => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // get brand wise products
    app.get('/products/:name', async(req, res) => {
      const brandName = req.params.name;
      const query = {brand: brandName};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    // get single product in terms of product id
    app.get('/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productCollection.findOne(query);
      res.send(result);
    })
    // post a single product to the cart
    app.post('/cart', async(req, res)  => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);
      res.send(result);
    })
    // get a single cart product
    app.get('/cart/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id:  id};
      const result = await cartCollection.findOne(query);
      res.send(result);
    })


    app.put('/update/:id', async(req, res)  => {
      const id = req.params.id;
    
      const updateProduct = req.body;
      const {name, image, price, rating, brand, type, details} = updateProduct;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: name,
          image: image,
          price: price,
          rating: rating,
          brand: brand,
          type: type,
          details: details
        }
      }
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result)
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



app.get('/', (req, res) => {
    res.send('QUANTUM SERVER IS RUNNING')
})

app.listen(port, () => {
    console.log(`listening on ${port}`);
})