//this route is used when getting the root page or when redirecting to root page after adding a new entry into database collection
const indexListing = async (req, res) => {
    try {
        const database = req.app.locals.database;

        //this contains a message from query param passed by updating the database
        //otherwise, default to the message for base index page
        const message = req.query.msg || 'Newest listings';

        //get the last 3 entries
        const listings = await database.collection('gundam-models').find().sort({ timestamp: -1 }).limit(3).toArray();

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

export { indexListing, form };