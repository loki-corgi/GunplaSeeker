// we don't care about modelName, modelGrade, streetNumber, streetName, city, province, sortBy, sortOrder
// technically any input that is unexpected when searching the database
// will cause the search query to not find anything which is what we want
// we only validate startDate, endDate, minPrice, maxPrice
// because it's easy to and is something we care about for our client 
// when they are using the filter for the query
const validateQuery = (req, res, next) => { 

    //stores info for error output
    res.locals.errors = [];
    
    const { startDate, endDate, minPrice, maxPrice } = req.query;

    //not empty considers null value && empty string
    const isNotEmpty = (val) => val != null && val.trim() !== '';

    console.log()

    let sDate = null;
    let eDate = null;
    let formattedMinPrice = null;
    let formattedMaxPrice = null;

    if(isNotEmpty(startDate) && isNotEmpty(endDate)) {

        console.log('startDate: ' +startDate)
        sDate = new Date(startDate.trim());
        eDate = new Date(endDate.trim());
        
    }

    if(isNotEmpty(formattedMinPrice) && isNotEmpty(formattedMaxPrice)) {

        formattedMinPrice = Number(minPrice.trim());
        formattedMaxPrice = Number(maxPrice.trim());
        
    }


    //checks if date queries are valid if they are not undefined
    if(isNotEmpty(startDate)) { 
        if(isNaN(sDate.getTime())) {  
            res.locals.errors.push({field: 'Date', message: 'Start date is not a valid date'});
        }
    }
    if(isNotEmpty(endDate)) { 
        if(isNaN(eDate.getTime())) {  
            res.locals.errors.push({field: 'Date', message: 'End date is not a valid date'});
        }
    }
    
    //checks if price queries are valid if they are not empty
    if(isNotEmpty(endDate)) { 
        if(isNaN(formattedMinPrice)) {  
            res.locals.errors.push({field: 'Price', message: 'minPrice is not a valid number'});
        }
    }
    if(isNotEmpty(endDate)) { 
        if(isNaN(formattedMaxPrice)) {  
            res.locals.errors.push({field: 'Price', message: 'maxPrice is not a valid number'});
        }
    }

    if(isNotEmpty(startDate) && isNotEmpty(endDate)) {
        //if startDate was greater than endDate then output error
        if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime()) && (sDate.getTime() > eDate.getTime())) {
            res.locals.errors.push({field: 'Date', message: 'Start date must be earlier than end date'});
        }
        
    }

    if(isNotEmpty(minPrice) && isNotEmpty(maxPrice)) {
        //if minPrice was greater than maxPrice then output error
        if (!isNaN(formattedMinPrice) && !isNaN(formattedMaxPrice) && (formattedMinPrice > formattedMaxPrice)) {  
            res.locals.errors.push({field: 'Price', message: 'minPrice is greater than maxPrice'});
        }
    }
    next();
};

export { validateQuery };