//needed in order to use Decimal128 for price
import { Decimal128 } from 'mongodb';

//grab model data based on user input
const getModels = async (req, res) => {
    try {
        const database = req.app.locals.database;

        let query = {};
        //default sort, priorities time before name
        let sortPriority = {timestamp: -1, modelName: 1};

        //set up page number using query string
        //the || 1 ensures that there is at least 1 page
        const page = parseInt(req.query.page) || 1;

        //set up pageSize for limiting displayed listings to 50 listing
        const pageSize = 50;

        //handles which documents to skip
        const skip = (page - 1) * pageSize;

        //note that every value from html is a string even when attribute restricts input as int, float, etc.
        const { startDate, endDate, modelName, modelGrade, minPrice, maxPrice, province, sortBy, sortOrder } = req.query;

        //since find(query) looks up the collection for all keys stated in query
        //the multiple if statements controls whether we look for product with only a certain key or multiple keys
        if (startDate && endDate) {
            //note that mongoDB automatically converts date to ISODate
            query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (modelName) {
            query.modelName = modelName;
        }
        if (modelGrade){
            query.modelGrade = modelGrade;
        }
        if (minPrice && maxPrice) {
            if (minPrice > maxPrice) {  
                throw new Error('minPrice is greater than maxPrice');
            }

            query.price = { $gte: Decimal128.fromString(minPrice), $lte: Decimal128.fromString(maxPrice)};
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
                sortPriority = { timestamp: order };
            }
            else if(sortBy == 'province') {
                sortPriority = { province: order };
            }

        }

        //grabs from database
        const results = await database.collection('gundam-models')
                .find(query)
                .sort(sortPriority) //model name and grade is sorted first before price
                .skip(skip)         //skips (page -1) * 50
                .limit(pageSize)    //limits to 50 listing
                .toArray();

        //stores total number of documents in collection
        //we don't use Array.length because the array we grabbed and store in results is not the entire listing
        const count = await database.collection('gundam-models')
                .countDocuments(query);

        //handles pagination
        const hasNextPage = page * pageSize < count;
        const hasPreviousPage = page > 1;
        
        //reuse index.ejs for search result
        res.render('index', { message: `Search Results: ${count} Total listings` ,  listings: results, currentPage: page, hasNextPage: hasNextPage, hasPreviousPage: hasPreviousPage } );

    }
    catch (e) {
        console.error(e);
        res.status(500).render('index', { message: e.message, listings: [], currentPage: 1, hasNextPage: null, hasPreviousPage: null });
    }
};

const getAllModels = async (req,res) => {

    try {

        const database = req.app.locals.database;

        //this searches the database collection for the total number of document
        const count = await database.collection('gundam-models').countDocuments({ });

        //if no data in collection then just show that there is no entries to list
        if(count == 0) { 
            res.render('listings', { message: `No Entries`, listings: { } });
        }
        else {

            //in aggregate, $group groups all data with the same modelName and outputs one entry
            //_id is the field to which to group the listing by
            //$sum calculates the number of entries with the same name
            //we use this to display the name of the model as well as number of entries for that model in listings.ejs
            const listings = await database.collection('gundam-models')
                .aggregate([
                    {    
                        $group: { _id: "$modelName", totalEntry: { $sum: 1 } }
                    }]
                )
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

                console.log(groupedListings);
            }
        
            res.render('listings', { message: `${count} Total Entries`, listings: groupedListings });

        }
    }
    //this catch is used only when there is an unexpected error with the searching the database
    catch (e) {
        console.dir(e, {depth: null});  //returns an object
        res.render('error', {errors: []});
    }
};

export {getModels, getAllModels}
