//grab model data based on user input
const getModel = async (req, res) => {
    try {
        const database = req.app.locals.database;

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
        //needed because potentially there is nothing to grab
        res.render('search-results', { searchResults: [] });
    }
};

const getAllModels = async (req,res) => {

    try {

        const database = req.app.locals.database;

        //in aggregate, $group groups all data with the same modelName and outputs one entry
        //$sum calculates the number of entries with the same name
        //we use this to display the name of the model as well as number of entries for that model in listings.ejs
        const listings = await database.collection('gundam-models')
            .aggregate(
                {    
                    //$group: { _id: "$modelName", totalEntry: { $sum: "$quantity" } }
                    $group: { modelName: "$modelName", totalEntry: { $sum: "$quantity" } }
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
};

export { getModel, getAllModels}
