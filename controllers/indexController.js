//this route is used when getting the root page or when redirecting to root page after adding a new entry into database collection
const indexListing = async (req, res) => {
    try {
        const database = req.app.locals.database;

        //this contains a message from query param passed by updating the database
        //otherwise, default to the message for base index page
        const message = req.query.msg || 'Newest listings';

        //get the newest 3 entries
        const listings = await database.collection('gundam-listings').aggregate(
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
                        path: "$modelInfo",   
                        // Unwind the modelInfo array to work with individual documents
                        //this is required, otherwise, the query will just ignore the modelName when matching documents
                        //basically the query would brake
                        preserveNullAndEmptyArrays: true  
                    }
                },
                //sort has to come before limit
                //otherwise, it would cut the database first before sorting them by timestamp
                { 
                    $sort: { timestamp: -1 }
                },
                {
                    $limit: 3
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
                },
            ]
        ).toArray();

        console.log("Newest listings:");
        console.log(listings);

        //since we reuse index.ejs for showing models grabbed with filter,
        //we need to set pagination variables to null to prevent errors
        res.render('index', { message: message, listings: listings, currentPage: null, hasNextPage: null, hasPreviousPage: null } );

    }
    catch(e) {
        console.error(e);
        //needed because potentially there is nothing to grab
        res.render('index', { message: 'No listing', listings: [], currentPage: null, hasNextPage: null, hasPreviousPage: null });
    }
};

//this is used to get form.ejs for client
const form = (req, res) => {
    res.render('form', { message: null });
}

//handles all other routes and display the error page
const invalidRoutes = async (req, res) => {
  
    res.status(404).render('error', { errors: [{field: '404', message: 'Page not found.'}] } );

}


export { indexListing, form, invalidRoutes };