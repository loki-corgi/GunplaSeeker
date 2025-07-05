import express from 'express';
import { client, connection } from './database.js';
import { validateForm } from 'validator';

const app = express();

app.set('view engine', 'ejs');

let server;
connection.then(()=>{
  console.log("Successful connection to database!");
  server = app.listen(3000, ()=>console.log('Server listening.'));
})
.catch(e=>console.error(e));

const database = client.db('gundam-db');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res)=>{
    res.render('index', { message: "" });
});

//search data in database to display
//async required so that we actually have data before we display it
app.get('models', validateQuery, async (req, res) => {

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
            query.price = { $gte: parseFloat(priceStart), $lte: parseFloat(priceEnd)};
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
        //needed because potentially 
        res.render('search-results', { searchResults: [] });
    }
});

//grabs all data and aggregate them into only one object in the array
app.get('listings', async (req,res) => {

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
});

//add product into database
//async required to prevent multiple post request from clashing
app.post('/update-db', validateForm, async (req,res)=>{

    if(!res.locals.errors.length > 0) {
        const model = {
            //set date to be start of date to only care about the day, month, year. might be useful if we want do something with the database that needs it
            timeStamp: new Date().setUTCHours(0,0,0,0),
            modelName: res.body.modelName,
            modelGrade: res.body.modelGrade,
            price: req.body.price,
            streetNumber: req.body.streetNumber,
            streetName: req.body.streetName,
            city: req.body.city,
            province: req.body.province
            //isFlagged: false    //used to handle weird data manually. maybe implement it?
        };  

        await database.collection("gundam-models").insertOne(model);
        res.render('index'  , { message: `Successfully added show ${model.name}` });
    }
    //handle error for validator
    else {
            res.render('error'  , { message: res.locals.errors });
    }
});