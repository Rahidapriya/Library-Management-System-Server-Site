const express = require('express');
const cors = require('cors');
const app=express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5005;

//middleware
app.use(cors());
app.use(express.json());





//const uri = "mongodb+srv://<username>:<password>@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
console.log(uri);
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
    //   await client.connect();
      // Send a ping to confirm a successful connection
    //   await client.db("admin").command({ ping: 1 });
    const bookCategoryCollection=client.db('libraryDB').collection('bookcategorycard')
    const booksCollection=client.db('libraryDB').collection('books')
//home page a book category niyechi
    app.get('/bookcategorycard',async(req,res)=>{
      const cursor=bookCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

  app.get('/books',async(req,res)=>{
    const cursor=booksCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

app.post('/books',async(req,res)=>{
  const newBook=req.body;
  console.log(newBook); 

 const result=await booksCollection.insertOne(newBook);
 res.send(result)
 
})
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('id-8-a11 is running in server')
})
app.listen(port,()=>{
    console.log(`id-8-a11 is running on port : ${port}`);
})


//id-8-a11 
//ttGqo7TJsB0XcYPV