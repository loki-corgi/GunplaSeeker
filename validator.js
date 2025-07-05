//validator is imported just in case new code written requires it
import validator from 'validator';

const validateForm = (req, res, next) => {

    res.locals.errors = [];

    const grades = ['Advance Grade', 'Entry Grade', 'EX Model', 'First Grade', 'Full Mechanics', 'High Grade', 'High-Resolution Model',
        'Hyper Hybrids Model', 'Limited Model', 'Mega Size', 'Master Grade', 'Master Grade Extreme', 'Master Grade Super-Deformed',
        'No-Grade', 'Perfect Grade', 'Reborn-One Hundred', 'Real Grade', 'Super-Deformed Extreme', 'Super Grade Collection'
    ];

    const provinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

    //unrealistic to check for street name and city. Bad data would inevitably happen.
    const { grade, streetNumber, price, province }= req.body;

    if (!grades.includes(grade)) {
        res.locals.errors.push({ field: 'grade', message: 'Model grade does not exists. Select No-Grade for unapplicable model grades.'});
    }

    if(!validator.isNumeric(streetNumber)) {
        res.locals.errors.push({ field: 'StreetNumber', message: 'Expected numbers for street number field'});
    }

    if(!validator.isFloat(price) && price > 0) {
        res.locals.errors.push({ field: 'price', message: 'Expected a float. Price should be greater than 0.'});
    }

    if (!provinces.includes(province)) {
        res.locals.errors.push({ field: 'province', message: 'No such province/territory.'});
    }1

    /*
    //only needed if we for some reason start inputting time manually
    //ISODate is ISO8601 so use validator to check for correct format
    if(!validator.isISO8601(time)) {
        res.locals.errors.push({ field: 'time', message: 'Time input is either incorrect or in an unfamiliar format. Use ISO8601 date format.'});
    }
    */

    next();
}

export { validateForm };