const setupCollections = database => {

    let modelCollection = database.createCollection('models', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'Gundam Model Object Collection',
                required: [ 'timestamp', 'modelName', 'modelGrade', 'price', 'streetNumber', 'streetName', 'city', 'province' ],
                properties: {
                    timestamp: {
                        bsonType: 'date',
                        description: "must be a Date object"
                    },
                    modelName: {
                        bsonType: 'string',
                        minLength: 1,
                        maxLength: 50,
                        description: 'Model Name that must be a string between 1 and 50 characters long'
                    },
                    modelGrade: {
                        bsonType: 'string',
                        enum: [
                            'Advance Grade', 'Entry Grade', 'EX Model', 'First Grade', 'Full Mechanics', 'High Grade', 'High-Resolution Model',
                            'Hyper Hybrids Model', 'Limited Model', 'Mega Size', 'Master Grade', 'Master Grade Extreme', 'Master Grade Super-Deformed',
                            'No-Grade', 'Perfect Grade', 'Reborn-One Hundred', 'Real Grade', 'Super-Deformed Extreme', 'Super Grade Collection'
                        ],
                        description: 'Model Grade must be a valid grade'
                    },
                    price: {
                        bsonType: 'decimal',
                        //note: it doesn't matter that the minimum is an int
                        //mongoDB compares the numeric value and not the storage format
                        minimum: 0,
                        description: 'Price must be a dollar amount greater than 0'
                    },
                    streetNumber: {
                        bsonType: 'int',
                        minimum: 1,
                        description: 'must be an integer greater than 0'
                    },
                    streetName: {
                        bsonType: 'string',
                        minLength: 2,
                        maxLength: 40,
                        description: 'must be a string between 2 and 40 characters long'
                    },
                    city: {
                        bsonType: 'string',
                        minLength: 3,
                        maxLength: 40,
                        description: 'must be a string between 3 and 40 characters long'
                    },
                    province: {
                        bsonType: 'string',
                        enum: ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
                        description: 'must be a valid province or territory of Canada'
                    }
                }
            }
        }
    });

    return Promise.all([modelCollection]);
};

export default setupCollections;