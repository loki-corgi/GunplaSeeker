import express from 'express';
import { connection, database } from './database.js';
import setupCollections from './collections.js';
import indexRouter from './routes/index.js';

const app = express();

let server;
connection
//the database is imported from database.js
.then(()=> setupCollections(database))
.then(()=>{
  console.log("Successful connection to database!");
  server = app.listen(3000, ()=>console.log('Server listening.'));

  app.locals.database = database;
})
.catch(e=>console.error(e));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//uses the index.js routes
app.use('/', indexRouter);