//needed in order to use Decimal128 for price
import { Decimal128 } from 'mongodb';

//routes for adding model into database
const addModel = async (req, res) => {
    try {
        const database = req.app.locals.database;

        const model = {
            //note that mongoDB automatically converts date to ISODate
            timestamp: new Date(),
            modelName: req.body.modelName,
            modelGrade: req.body.modelGrade,
            //what this does is that req.body.price is a string
            //then it is passed into Number to change it to a number
            //then the toFixed(2) method from Number rounds the number to 2 decimal places and revert it back to string (toFixed() returns a string)
            //then Decimal128.fromString() grabs the resulting string from toFixed(2) and convert it to Decimal128
            price: Decimal128.fromString(Number(req.body.price).toFixed(2)),
            streetNumber: parseInt(req.body.streetNumber),
            storeName: req.body.storeName,
            streetName: req.body.streetName,
            city: req.body.city,
            province: req.body.province
        };  

        await database.collection("gundam-models").insertOne(model);
        res.render('form'  , { message: `Successfully added ${model.modelName}` });

        //when model is successfully added into database, redirect to index which will show the new listing with a message passed into query param
        //res.redirect(`/?msg=Successfully+added+${model.name}`);
    }
    //this catch is used when inputting into database produced some schema validation error
    catch (e) {
        console.dir(e, {depth: null});
        res.render('error', { errors: [] });
    }
};

export { addModel };