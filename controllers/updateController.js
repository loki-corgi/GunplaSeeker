//needed in order to use Decimal128 for price
import { Decimal128 } from 'mongodb';

//route for adding model listing into database
//validation for addModel is handled via the database schema validation
const addModel = async (req, res) => {
    
    // API fetch request consideration and how to manage it
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    //Note: ? before .includes('application/json'); is required just in case the fetch api does not include content-type in headers field
    const isFetchRequest = req.headers['content-type']?.includes('application/json');

    //logic for handling response
    const sendSuccessResponse = (res, isFetchRequest, message) => {
        if (isFetchRequest) {
            res.status(201).json({ message });
        } 
        else {
            const msgString = message.message;
            res.redirect(`/?msg=${encodeURIComponent(msgString)}`);
    };
    const sendErrorResponse = (res, isFetchRequest, statusCode, message) => {
        if (isFetchRequest) {
            res.status(statusCode).json(message);
        } else {
            if(statusCode == 400) {
                res.status(statusCode).render('form', { errors: message });
            }
            else if (statusCode == 500) {
                res.status(statusCode).render('error', { errors: message });
            }
        }
    };

    try {

        const database = req.app.locals.database;

        const normalizedName = req.body.modelName.trim()
            // escape special chars (except hyphen) 
            .replace(/["'“”‘’]/g, '(?:["\'“”‘’])?')
            .toUpperCase();


        //Check if model info exists
        //findOne returns an object containing _id and modelName
        let modelInfo = await database.collection('gundam-models-list').findOne({
            modelName: normalizedName
        });

        //Insert model info if it doesn't exist
        if (!modelInfo) {
            const insertResult = await database.collection('gundam-models-list').insertOne({
                modelName: normalizedName
            });
            //since insertOne will return a object with an insertedID field into insertResult, we just grab that for modelInfo object
            //modelName irrelevant here
            modelInfo = { _id: insertResult.insertedId };
        }

        //add listing with reference of model_Id
        const modelListing = {
            //note that mongoDB automatically converts date to ISODate
            timestamp: new Date(),
            //this is either a new _id from the created model or an old _id grabbed from the search
            model_Id: modelInfo._id,
            //what this does is that req.body.price is a string
            //then it is passed into Number to change it to a number, if possible
            //then the toFixed(2) method from Number rounds the number to 2 decimal places and revert it back to string (toFixed() returns a string)
            //then Decimal128.fromString() grabs the resulting string from toFixed(2) and convert it to Decimal128
            modelGrade: req.body.modelGrade,
            price: Decimal128.fromString(Number(req.body.price).toFixed(2)),
            storeName: req.body.storeName,
            streetNumber: parseInt(req.body.streetNumber),
            streetName: req.body.streetName,
            city: req.body.city,
            province: req.body.province
        };

        await database.collection('gundam-listings').insertOne(modelListing);

        sendSuccessResponse(res, isFetchRequest,{ message: `Successfully added listing for ${req.body.modelName}` });

    } 
    //this catch is used when inputting into database produced some schema validation error
    catch (e) {
        console.dir(e, { depth: null });

        //when error has a 121 code then try to get the error info from the error object
        if (e.code == 121) {
            //stores the multiple possible schemaRule broken
            const schemaRules = e.errorResponse.errInfo.details.schemaRulesNotSatisfied;
            
            //finds either propertiesNotSatisfied or nothing which will then make this an empty array
            const propertiesNotSatisfied = schemaRules.find(rule => rule.operatorName == "properties")
                .propertiesNotSatisfied || [];

            //do something here only when we grabbed propertiesNotSatisfied from schemaRules
            if (propertiesNotSatisfied.length > 0) {
                const errors = propertiesNotSatisfied.map(prop => ({
                    field: prop.propertyName,
                    message: prop.description
                }));

                sendErrorResponse(res, isFetchRequest, 400, errors);

            } 
            //there shoudn't be other validation errors but we still catch it just in case
            else {
                
                const error = [{ field: 'error', message: 'Non-propertiesNotSatisfied Validation error' }];

                sendErrorResponse(res, isFetchRequest, 400, error);
            }  
        } 
        //this runs when the error is not from mongodb schema validation
        else {
            
            const error = [{ field: 'error', message: 'Something went wrong' }];

            sendErrorResponse(res, isFetchRequest, 500, error);
            
        }
    }
};

export { addModel };






































/*

//route for adding model listing into database
const addModel = async (req, res) => {
    try {
        const database = req.app.locals.database;

        const model = {
            //note that mongoDB automatically converts date to ISODate
            timestamp: new Date(),
            modelName: req.body.modelName,
            modelGrade: req.body.modelGrade,
            price: Decimal128.fromString(Number(req.body.price).toFixed(2)),
            streetNumber: parseInt(req.body.streetNumber),
            streetName: req.body.streetName,
            city: req.body.city,
            province: req.body.province
        };  

        // Only add storeName if it exists and passes length check
        if (req.body.storeName && req.body.storeName.length >= 2) {
            model.storeName = req.body.storeName;
        }

        await database.collection("gundam-models").insertOne(model);
        res.render('form'  , { message: `Successfully added ${model.modelName}` });
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

*/