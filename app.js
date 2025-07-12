import express from 'express';
let app = express(); 

import { connection, database } from './database.js';
import setupCollections from './collections.js';

import indexRouter from './routes/index.js';

let server;
connection
// Uncomment the line below when ready to test setupCollections. It's not necessary before then.
.then(()=>setupCollections(database)) 
.then(()=>{
  console.log("Success: connected to database!");
  server = app.listen(3000, ()=>console.log('Server ready'));

  //set up locals so that we can see the database within the router files
  //its either this or we past the database into the routes (dependency injection)
  //dependency injection is useful if you have multiple databases
  //so that you can change the database the routes access modularly
  app.locals.database = database;
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Get home page with forms 
app.get("/", (req,res)=>{
    // Get all actors from database
    database.collection("Actors").find().toArray()
    .then(actors=>{
        // render the home page template with list of actors 
        res.locals.actors = actors;
        res.render('index');
    })
    .catch(e=>{
        console.error(e);
        res.status(500).send("An error has occurred");
    });
});

app.use('/api/v1', indexRouter);