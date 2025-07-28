//needed in order to use Decimal128 for price
import { Decimal128 } from 'mongodb';

//route for adding model listing into database
const addModel = async (req, res) => {
    try {
        const database = req.app.locals.database;

        const model = {
            //note that mongoDB automatically converts date to ISODate
            timestamp: new Date(),
            modelName: req.body.modelName,
            modelGrade: req.body.modelGrade,
            //what this does is that req.body.price is a string
            //then it is passed into Number to change it to a number, if possible
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

        //when error has a 121 code then try to get the error info from the error object
        if (e.code == 121) {
            
            //stores the multiple possible schemaRule broken
            const schemaRules = e.errorResponse.errInfo.details.schemaRulesNotSatisfied;

            //finds either propertiesNotSatisfied or nothing which will then make this an empty array
            const propertiesNotSatisfied = schemaRules.find(rule => rule.operatorName == "properties")
                .propertiesNotSatisfied || [];

            //do something here only when we grabbed propertiesNotSatisfied from schemaRules
            if(propertiesNotSatisfied.length > 0) {

                const errors = propertiesNotSatisfied.map(prop => ({
                    field: prop.propertyName,
                    message: prop.description
                }));

                res.status(400).render('error', { errors: errors });
            }
            else {
                res.status(400).render('error', { errors: [{ field: 'error', 
                    message: 'something other than propertiesNotSatisfied has been found'}] });
            }
        }
        //this runs when the error is not from mongodb schema validation
        else {
            res.status(400).render('error', { errors: [{field: 'error', message: 'something went wrong'}] });
        }
        
    }
};

export { addModel };