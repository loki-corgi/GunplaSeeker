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

/*
//search data in database to display
//async required so that we actually have data before we display it
app.get('search-model', async (req, res) => {

    try {
        let query = {};
        const { modelName, modelGrade, priceStart, priceEnd, province } = req.query;

        //since find(query) looks up the collection for all keys stated in query
        //the multiple if statements controls whether we look for product with only a certain key or multiple keys
        if (modelName) {
            query.modelName = modelName;
        }
        if (modelGrade){
            query.modelGrade = modelGrade;
        }
        if (priceStart && priceEnd) {
            query.price = { $gte: NumberDecimal(priceStart), $lte: NumberDecimal(priceEnd)};
        }
        if (province) {
            query.province = province;
        }

        const results = await database.collection('gundam-models')
            .find(query)
            .sort({modelName: 1, modelGrade: 1, price: 1})   //model name and grade is sorted first before price
            .toArray();

        res.render('search-results', { searchResults: results } );

    }
    catch (e) {
        console.error(e);
        //needed because potentially there is nothing to grab
        res.render('search-results', { searchResults: [] });
    }
});
*/

/*
//grabs all data and aggregate them into only one object in the array
app.get('listings', async (req,res) => {

    try {
        //in aggregate, $group groups all data with the same modelName and outputs one entry
        //$sum calculates the number of entries with the same name
        //we use this to display the name of the model as well as number of entries for that model in listings.ejs
        const listings = await database.collection('gundam-models')
            .aggregate(
                {
                    $group: { _id: "$modelName", totalEntry: { $sum: "$quantity" } }
                }
            )
            .toArray();
        
        //troubleshoot
        console.log(listings);
        
        res.render('listings', { searchResults: listings });
    }
    catch (e) {
        console.dir(e, {depth: null});
        res.render('error', {message: 'Problem getting collection in database'});
    }
});
*/

/*
//add product into database
//async required to prevent multiple post request from clashing
app.post('/update-collection', async (req,res)=>{

    try {
        const model = {
            //set date to be start of date to only care about the day, month, year. might be useful if we want do something with the database that needs it
            dateAdded: new Date().setUTCHours(0,0,0,0),
            modelName: res.body.modelName,
            modelGrade: res.body.modelGrade,
            price: Decimal(req.body.price),
            streetNumber: req.body.streetNumber,
            streetName: req.body.streetName,
            city: req.body.city,
            province: req.body.province
        };  

        await database.collection("gundam-models").insertOne(model);
        res.render('index'  , { message: `Successfully added ${model.name}` });
    }
    catch (e) {
        console.dir(e, {depth: null});
        res.render('error', { message: 'One or more fields are invalid' });
    }
});
*/