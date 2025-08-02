//needed in order to use Decimal128 for price
import { Decimal128 } from 'mongodb';

//grab model data based on user input
//validation for getting model listing
const getListings = async (req, res) => {

    // API fetch request consideration and how to manage it
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    //Note: ? after headers['content-type'] is required just in case the fetch api 
    // does not include content-type in headers field
    //basically ensures an undefined or null value instead of an error
    //when an undefined value is passed into includes method
    const isFetchRequest = req.headers['content-type']?.includes('application/json');

    //logic for handling response
    const sendSuccessResponse = (res, isFetchRequest, message) => {
        if (isFetchRequest) {
            res.status(201).json(message);
        } else {
            res.status(201).render("index", message );
        }
    };
    const sendErrorResponse = (res, isFetchRequest, statusCode, message) => {
        if (isFetchRequest) {
            res.status(statusCode).json(message);
        } else {
            res.status(statusCode).render("error", { errors: message });
        }
    };
    
    //-----------------------------------------------------------------------------------------

    try {

        if(res.locals.errors.length > 0) {
            const error = new Error('Validation Error');
            error.statusCode = 400;

            throw error;
        }

        const database = req.app.locals.database;

        //stores the query to be used in $match inside aggregate method
        let query = {};

        //default sort, priorities time before name
        let sortPriority = {timestamp: -1, modelName: 1};

        //set up page number using query string
        //the || 1 ensures that there is at least 1 page
        //if parseInt(req.query.page) is undefined
        const page = parseInt(req.query.page) || 1;

        //set up pageSize for limiting displayed listings to 10 listing
        const pageSize = 10;

        //handles which documents to skip
        const skip = (page - 1) * pageSize;

        //note that every value from html is a string even when attribute restricts input as int, float, etc.
        const { startDate, endDate, modelName, modelGrade, minPrice, maxPrice, province, sortBy, sortOrder } = req.query;

        //-----------------------------------------------------------------------------------------

        //build query for $match in aggregate

        //store dates into Date object
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        //ensures that we only set hours if there is an eDate object
        if(eDate) {
            //Note: We set the end Date to be the very last ms to cover the whole day of the date
            eDate.setUTCHours(23, 59, 59, 999);

        }
        if (startDate && endDate) {
            query.timestamp = { $gte: sDate, $lte: eDate };
        }
        else if (startDate) {
            query.timestamp = { $gte: sDate };
        }
        else if (endDate) {
            query.timestamp = { $lte: eDate };
        }

        //its possible for modelGrade to be an array
        //however, our filter from the client will not send an array here
        if (modelGrade) {

            //ensures an array is used to search the query
            query.modelGrade = Array.isArray(modelGrade) ? { $in: modelGrade } : { $in: [modelGrade] };
        }
        if (minPrice && maxPrice) {

            if(parseInt(maxPrice) >= 1010) {
                query.price = { $gte: Decimal128.fromString(minPrice)};
            
            }
            else {
                query.price = { $gte: Decimal128.fromString(minPrice), $lte: Decimal128.fromString(maxPrice)};
            }
        }
        if (province) {
            query.province = province;
        }
        //modelName here has a different logic to the rest of the query logic
        if (modelName && modelName.trim() != '') {
            //we need to escape special characters so that the regex doesn't complicate things
            const normalizedSearch = modelName.trim()
                // escape special chars
                .replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&') 
                // make quotes optional, note that there are special quote characters
                .replace(/["'“”‘’]/g, '(?:["\'“”‘’])?');   

            //finally we also force the regex to consider only whole words
            const modelCollectionQuery = { modelName: { $regex: `(^|\\s)${normalizedSearch}(\\s|$)`, $options: 'i' }} ;

            //we get the model documents based on the regex query
            const models = await database.collection('gundam-models-list').find(modelCollectionQuery).toArray();
            
            //if models exist
            if (models.length > 0) {
                //Map the modelName of each matching model into modelNames
                query.model_Id = { $in: models.map(model => model._id) };
            } else {
                //If no models found, force no matches by setting modelNames to an empty array
                query.model_Id = { $in: [] };
            }
        }
        
        let sortOption = 'modelName';

        //control sorting priority
        //if not chosen in html, sortBy is undefined which will use the default sort
        if (sortBy) {
            //determines whether the sort is ascending or descending
            let order = (sortOrder === 'desc') ? -1 : 1;

            //if sortBy has none of these strings then sort is defaulted not sorted at all
            if(sortBy == 'name') {
                sortOption = 'modelName';
            }
            else if(sortBy == 'grade') {
                sortOption = 'modelGrade';
            }
            else if(sortBy == 'price') {
                sortOption = 'price';
            }
            else if(sortBy == 'date') {
                sortOption = 'timestamp';
            }
            else if(sortBy == 'province') {
                sortOption = 'province';
            }

            sortPriority = { [sortOption]: order };
        }

        //stores the total number of matches into count for pagination
        const countDoc = await database.collection('gundam-listings').aggregate([
                { $match: query },
                { $count: 'totalCount' }
            ]).toArray();
        
        //ensure either a countDoc has an Array of object or count variable is set to 0
        const count = countDoc[0]?.totalCount || 0;

        const results = await database.collection('gundam-listings').aggregate(
            [
                {
                    $lookup: {
                        from: 'gundam-models-list',
                        localField: 'model_Id',
                        foreignField: '_id',
                        as: 'modelInfo'
                    }
                },
                {
                    $unwind: {
                        path: "$modelInfo",   // Unwind the modelInfo array to work with individual documents
                        //this is required, otherwise, the query will just ignore the modelName when matching documents
                        //basically the query would brake
                        preserveNullAndEmptyArrays: true  
                    }
                },
                {
                    $match: query
                },
                { 
                    $sort: sortPriority 
                },
                //Handles which listings to grab
                {
                    $skip: skip
                },
                {
                    $limit: pageSize
                },
                {
                    $project: {
                        timestamp: true,
                        modelName: '$modelInfo.modelName',
                        modelGrade: true,
                        price: true,
                        storeName: true,
                        streetNumber: true,
                        streetName: true,
                        city: true,
                        province: true
                    }
                }
            ]
        ).toArray();

        //handles pagination
        const hasNextPage = page * pageSize < count;
        const hasPreviousPage = page > 1;

        //create a copy of query and remove page from queryCopy
        const queryCopy = { ...req.query };
        delete queryCopy.page;

        //reuse index.ejs for search result
        //we send currentPage, nextPage, previousPage and query for pagination
        res.render('index', { message: `Search Results: ${count} 
            Total listings` ,  
            listings: results, 
            currentPage: page, 
            hasNextPage: hasNextPage, 
            hasPreviousPage: hasPreviousPage, 
            //send the query so that ejs can handle it
            query: queryCopy
        });

    }
    //catches defined throw and errors from validation before searching database
    //otherwise, will display some error while handling code
    catch (e) {
        console.error(e);
        console.dir(e, {depth: null});

        const error = { field: "Error", message: e.message };

        //ensure status code exists to parse into sendErrorResponse
        const statusCode = e.statusCode || 500; 

        // if this triggers, that means something in our code failed
        // therefore, status code 500
        if(statusCode == 500) {
            res.locals.errors.push(error);
        }

        sendErrorResponse(res, isFetchRequest, parseInt(statusCode), res.locals.errors);

    }
};

const getAllListings = async (req,res) => {

    // API fetch request consideration and how to manage it
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    //Note: ? after headers['content-type'] is required just in case the fetch api 
    // does not include content-type in headers field
    //basically ensures an undefined or null value instead of an error
    //when an undefined value is passed into includes method
    const isFetchRequest = req.headers['content-type']?.includes('application/json');

    //logic for handling response
    const sendSuccessResponse = (res, isFetchRequest, message) => {
        if (isFetchRequest) {
            res.status(201).json( message );
        } else {
            res.status(201).render('listings',  message );
        }
    };
    const sendErrorResponse = (res, isFetchRequest, statusCode, message) => {
        if (isFetchRequest) {
            res.status(statusCode).json( message );
        } else {
            res.status(statusCode).render('error', { errors: message });
        }
    };

    try {

        const database = req.app.locals.database;

        //this searches the database collection for the total number of document
        const count = await database.collection('gundam-listings').countDocuments({ });

        //if no data in collection then just show that there is no entries to list
        if(count == 0) { 
            return sendSuccessResponse(res, isFetchRequest, { message: 'No Entries', listings: { } });
        }
        else {

            //group listings with the same name together and count the number of same listings
            const listings = await database.collection('gundam-listings')
                .aggregate([
                    {
                        $lookup: {
                            from: 'gundam-models-list', // Join with the 'gundam-models' collection
                            localField: 'model_Id', // field in 'gundam-listings' collection
                            foreignField: '_id',   // field in 'gundam-models' collection
                            as: 'modelInfo'        // name of the field where the joined data will be stored
                        }
                    },
                    {
                        $unwind: { path: '$modelInfo', preserveNullAndEmptyArrays: true } // Unwind modelInfo to flatten the result
                    },
                    {
                        $group: {
                            _id: '$modelInfo.modelName',  // Group by modelName from 'gundam-models'
                            totalEntry: { $sum: 1 }        // Count how many entries exist for each model
                        }
                    },
                    {
                        $sort: { _id: 1 }  // Sort by modelName alphabetically
                    }
                ])
                .toArray();

            //now group each entry to the first character
            const groupedListings = {};

            //loops the array of listings to add into groupedListing object
            //reminder that trying looping an empty array will not execute anything inside the loop since we never actually go into the loop
            for(let model of listings) {
                let name = model._id;
                let firstChar = name.charAt(0).toUpperCase();

                //make new character group array in groupedListing if no existing key
                if(!groupedListings[firstChar]) {
                    groupedListings[firstChar] = [];
                }

                //push object into array of character group key
                groupedListings[firstChar].push({
                    modelName: name,
                    totalEntries: model.totalEntry
                });

            }

            const message = { message: `${count} Total Entries`, listings: groupedListings };
        
            sendSuccessResponse(res, isFetchRequest, message);

        }
    }
    //this catch is used only when there is an unexpected error with the searching the database
    catch (e) {
        console.dir(e, {depth: null});
        sendErrorResponse(res, isFetchRequest, 500, [{field: "error", message: "something unexpected happened"}]);
    }
};

export {getListings, getAllListings}
