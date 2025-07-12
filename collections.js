const setupCollections = database => {

    let showCollection = database.createCollection('Shows',{ validator: {
        $jsonSchema: {
            // TODO: validation schema for show documents
            bsonType: "object",
            title: "Shows Object Validation",
            required: [ "title", "numberOfSeasons", "firstEpisodeYear", "topActors"],
            properties: {
                title: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 30,
                    description: "must be a string of 2-30 characters long"
                },
                numberOfSeasons: {
                    bsonType: "int",
                    minimum: 1,
                    description: "must be an integer greater than 1"
                },
                firstEpisodeYear: {
                    bsonType: "int",
                    minimum: 1900,
                    maximum: 2100,
                    description: "must be an integer between 1900 and 2100"
                },
                //subschema of topActors is similar to regular schema. it is just nested within items operator. Note that since items in array is not named,
                //the schema uses items as substitute for the name
                topActors: {
                    bsonType: "array",
                    items: {
                        bsonType: "objectId",
                        description: "must contain ObjectId of actor"
                    }
                }
            }
        }
    }});
    let actorCollection = database.createCollection('Actors',{ validator: {
        $jsonSchema: {
            // TODO: validation schema for actor 
            bsonType: "object",
            title: "Actor Object Validation",
            required: ["name"],
            properties: {
                name: {
                    bsonType:"string",
                    minLength: 1,
                    maxLength: 30,
                    description: "must be a string between 1 and 30 characters"
                }
            }
        }
    }});

    return Promise.all([showCollection, actorCollection]);
}

export default setupCollections;