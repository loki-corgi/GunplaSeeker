const indexListing = async (req, res) => {
    try {
        const database = req.app.locals.database;

        //this contains something only when redirect to index happens with a query param
        const message = req.query.msg || '';

        //get the last 3 entries
        const listings = await database.collection('gundam-models').find().sort({ timestamp: -1 }).limit(3).toArray();

        res.render('index', { message: message, newestListings: listings } );

    }
    catch(e) {
        console.error(e);
        //needed because potentially there is nothing to grab
        res.render('index', { message: 'No listing', newestListings: [] });
    }
};