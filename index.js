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
//get by category name
app.get('/booksbycategory/:category_name',async(req,res)=>{
  const category_name = req.params.category_name;
  query={category_name: category_name }
    const result = await booksCollection.find(query).toArray();
  res.send(result);
})

// get operation for update books
app.get('/books/:id',async(req,res)=>{
  const id= req.params.id;
  const query ={_id: new ObjectId(id)}
 
  const result = await booksCollection.findOne(query);
  res.send(result);
})

app.put('/books/:id',async(req,res)=>{
  const id =req.params.id;
  console.log(id);
  const filter={_id:new ObjectId(id)}
  const options={upsert:true};
  const updatedbook=req.body;
  const book={
    $set:{
      name:updatedbook.name,
      photo:updatedbook.photo,
      category_name:updatedbook.updateCategoryName,
      author_name:updatedbook. author_name,
      rating:updatedbook.rating,
      quantity:updatedbook.quantity,
      desp:updatedbook.desp,
     
    }
  }
  console.log(book);
  const result = await booksCollection.updateOne(filter,book,options);
  res.send(result)
})
// app.get('/books/:id', async (req, res) => {
//   const id = req.params.id;
//   const query = { _id: new ObjectId(id) };

//   try {
//     const result = await booksCollection.findOne(query);
//     if (result) {
//       res.json(result);
//     } else {
//       res.status(404).send('Book not found');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.put('/books/:id', async (req, res) => {
//   const id = req.params.id;
//   console.log(id);
//   const filter = {_id:new ObjectId(id)};
//   const options={upsert:true};
//   const updatedBook = req.body;

//   const book={
//     $set:{
//       name:updatedBook.name,
//       photo:updatedBook.photo,
//       category_name:updatedBook.updateCategoryName,
//       author_name:updatedBook.author_name,
//       rating:updatedBook.rating,
//       quantity:updatedBook.quantity,
//       desp:updatedBook.desp,
//     }
//   };

//   try {
//     const result = await booksCollection.updateOne(filter,book,options);
//     if (result.modifiedCount === 1) {
//       res.json({ message: 'Book updated successfully' });
//     } else {
//       res.status(404).send('Book not found');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

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