//needed in order to use Decimal128 for price
import { Decimal128 } from 'mongodb';

//grab model data based on user input
const getModel = async (req, res) => {
    try {
        const database = req.app.locals.database;

        let query = {};
        //default sort, priorities time before name
        let sortPriority = {timestamp: -1, modelName: 1};

        //note that every value from html is a string even when attribute restricts input as int, float, etc.
        const { startDate, endDate, modelName, modelGrade, startPrice, endPrice, province, sortBy, sortOrder } = req.query;

        //since find(query) looks up the collection for all keys stated in query
        //the multiple if statements controls whether we look for product with only a certain key or multiple keys
        if (startDate && endDate) {
            //note that mongoDB automatically converts date to ISODate
            query.timestamp = { $gte: new Date(dateStart), $lte: new Date(dateEnd) };
        }
        if (modelName) {
            query.modelName = modelName;
        }
        if (modelGrade){
            query.modelGrade = modelGrade;
        }
        if (startPrice && endPrice) {
            query.price = { $gte: Decimal128.fromString(startPrice), $lte: Decimal128.fromString(startPrice)};
        }
        if (province) {
            query.province = province;
        }

        //control sorting priority
        //if not chosen in html, sortBy is undefined which will use the default sort
        if (sortBy) {
            //determines whether the sort is ascending or descending
            let order = 1;
            //only change it when descending since it makes sense to default sort to ascending order
            if (sortOrder == 'desc') {
                order = -1;
            }

            if(sortBy == 'name') {
                sortPriority = { modelName: order};
            }
            else if(sortBy == 'grade') {
                sortPriority = { modelGrade: order};
            }
            else if(sortBy == 'price') {
                sortPriority = { price: order};
            }
            else if(sortBy == 'date') {
                sortPriority = { date: order };
            }
            else if(sortBy == 'province') {
                sortPriority = { province: order };
            }

        }

        //grabs from database
        const results = await database.collection('gundam-models')
                .find(query)
                .sort(sortPriority)   //model name and grade is sorted first before price
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

export {getModel, getAllModels}
