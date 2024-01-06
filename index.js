const express = require('express');
const cors = require('cors');
const app=express();
//require jwt
const jwt =require('jsonwebtoken')
//cookie
const cookieParser=require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5005;

//middleware
app.use(cors({
  origin:[
    'https://id-8-a11.web.app','http://localhost:5005/'
  ],
  credentials:true,
  optionSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json());





//const uri = "mongodb+srv://<username>:<password>@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware for cookie parser
const logger=(req,res,next)=>{
  console.log('cookiee',req.method,req.url);
  next();
}
// const verifyToken=(req,res,next)=>{
//   const token=req?.cookies?.token;
//   console.log('middleware verify token:',token);
//   if(!token){
//     return res.status(401).send({message:'Unautharized Access'})
//   }
//   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded))
//   {
//     if(err){
//     return res.status(401).send({message:'Unautharized Access'})
//     req.user=decoded;
//     next();
//   }
// }
// }
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log('middleware verify token:',token);
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized Access' });
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decoded)) 
  {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized Access' });
      req.user = decoded;
      next();
    }
  };
};


async function run() {
    try {
     
    const bookCategoryCollection=client.db('libraryDB').collection('bookcategorycard')
    const booksCollection=client.db('libraryDB').collection('books')
    const addBorrowedCollection=client.db('libraryDB').collection('addtoborrow')

//jwt login
app.post('/jwt',async(req,res)=>{
  const user=req.body;
  console.log('user for token',user);
  const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
  res.cookie('token',token,{
    httpOnly:true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  })
  .send({success:true});
 })
 //jwt logout
 app.post('/logout',async(req,res)=>{
  const user = req.body;
  // res.clearCookie('token',{maxAge:0,secure: process.env.NODE_ENV === 'production', 
  // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',})
  // send({success:true})
 res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
 })


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
// app.get('/books',logger,async(req,res)=>{
//   console.log(req.query.email);
//   console.log('token owner info:',req.user);
//   if(req.user.email!==req.query.email){
//     return res.status(403).send({message:'forbidden'})
//   }
//   let quary={};
//   if(req.query?.email){
//     quary={email:req.query.email}
//   }
//   // const cursor=booksCollection.find();
//   // const result = await cursor.toArray();
//   const result=await booksCollection.find(quary).toArray()
//   res.send(result);
// })

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
//  add to borrowed books

app.get('/addtoborrow',async(req,res)=>{
 
  const cursor=addBorrowedCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
// app.post('/addtoborrow',async(req,res)=>{
//   const addtoborrow=req.body;
//   console.log(addtoborrow); 

//  const result=await addBorrowedCollection.insertOne(addtoborrow);
//  res.send(result)
 
// })
// remove book/return book
app.post('/deleteborrow/:id', async(req,res)=>{
  const id =req.params.id;
  const bookId=req.body.bookId;
  console.log(id);
  console.log(req.body.bookId);
  
  const query={_id:new ObjectId(id)}
  const result = await addBorrowedCollection.deleteOne(query);

  const result2= await booksCollection.updateOne(
            {bookId:bookId},
            { $inc: { quantity: +1 } }
          );
  res.send({result,result2});
})


 // Handle book return
//  app.delete('/addtoborrow/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     const result = await addBorrowedCollection.deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount ) {
//       const bookId = req.body.bookId;

//       const borrowedBook = await booksCollection.findOne({ _id: new ObjectId(bookId) });

//       if (borrowedBook) {
//         const updatedQuantity = borrowedBook.quantity + 1;

//         await booksCollection.updateOne({ _id: new ObjectId(bookId) }, {
//           $set: { quantity: updatedQuantity },
//         });

//         return res.status(200).json({ message: 'Book Returned Successfully' });
//       }

//       return res.status(500).json({ error: 'Failed to return the book' });
//     }
//   }catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//   });





//borrow and quantity reduce
app.post('/addtoborrow', async (req, res) => {
  const addtoborrow = req.body;
  const bookname = req.body.name;
  const userEmail = req.body.userEmail;
  console.log(bookname, userEmail);

  try {
    // Check if the user has already borrowed the book
    const output = await addBorrowedCollection.findOne({
      name: bookname,
      userEmail: userEmail,
    });

    if (!output) {
      const result = await addBorrowedCollection.insertOne(addtoborrow);

      if (result.insertedId) {
        const bookId = addtoborrow.bookId;
        console.log('bookId', bookId);

        // Decrease the quantity of the borrowed book by 1
        const borrowedBook = await booksCollection.findOne({ bookId: bookId });

        if (borrowedBook) {
          const updatedQuantity = borrowedBook.quantity - 1;
          console.log('updated quantity', updatedQuantity);

          if (updatedQuantity >= 0) {
            // Ensure quantity doesn't go below zero
            await booksCollection.updateOne(
              { bookId: bookId },
              { $set: { quantity: updatedQuantity } }
            );

            return res.status(200).json({ message: 'Book Borrowed Successfully' });
          } else {
            return res.status(400).json({ error: 'Book is out of stock' });
          }
        } else {
          return res.status(404).json({ error: 'Book not found' });
        }
      }

      return res.status(500).json({ error: 'Failed to borrow the book' });
    }

    return res.status(400).json({ error: 'You have already borrowed that book' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//////////////////////////
// app.post('/addtoborrow', async (req, res) => {
//   const addtoborrow = req.body;

//   try {
//     // Insert the book to be borrowed into the 'addtoborrow' collection
//     const result = await addBorrowedCollection.insertOne(addtoborrow);

//     if (result.insertedId) {
//       // Book borrowed successfully
//       const bookId = addtoborrow._id; // Assuming _id is the book's unique identifier

//       // Update the book's quantity in the 'books' collection, decrementing it by 1
//       await booksCollection.updateOne(
//         { _id: new ObjectId(bookId) },
//         { $inc: { quantity: -1 } } // Decrement the quantity by 1
//       );

//       return res.status(200).json({ message: "Book Borrowed Successfully" });
//     }

//     return res.status(500).json({ error: "Failed to borrow the book" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

///////////////////////////
// app.post('/addtoborrow', async (req, res) => {
//   const addtoborrow = req.body;

//   try {
//     // Insert the book to be borrowed into the 'addtoborrow' collection
//     const result = await addBorrowedCollection.insertOne(addtoborrow);

//     if (result.insertedId) {
//       // Book borrowed successfully
//       const bookId = addtoborrow._id; // Assuming _id is the book's unique identifier

//       // Decrease the quantity of the borrowed book by 1
//       const borrowedBook = await booksCollection.findOne({ _id: new ObjectId(bookId) });

//       if (borrowedBook) {
//         const updatedQuantity = borrowedBook.quantity - 1;
        
//         // Update the book's quantity in the 'books' collection
//         await booksCollection.updateOne({ _id: new ObjectId(bookId) }, {
//           $set: { quantity: updatedQuantity }
//         });

//         return res.status(200).json({ message: "Book Borrowed Successfully" });
//       }
//     }

//     return res.status(500).json({ error: "Failed to borrow the book" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
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


