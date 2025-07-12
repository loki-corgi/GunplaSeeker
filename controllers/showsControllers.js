import { ObjectId } from 'mongodb'; //we only need ObjectID from the module so we don't import everything from it

//add new show into the database
const addShow = async (req, res) => {

    //grabs database connection via req
    const database = req.app.locals.database;

    try {
        //grabs checked boxes from actors checkbox
        //should be an array unless only one checked box
        //therefore we guarantee it
        //we could have reused checkActor if we didnt use const
        const checkActor = req.body.checkActor;

        /* used if checkActor was let
        if (!Array.isArray(checkActor)) {
            checkActor = [ checkActor ]
        }
        */

        let guaranteedcheckActorArray = [];

        if (!Array.isArray(checkActor)) {
            guaranteedcheckActorArray = [ checkActor ]
        }
        else {
            guaranteedcheckActorArray = checkActor;
        }

        //reminder that an const array is still mutable because its only a const reference to the array in memory
        //the contents of the array can still be added or removed
        const actors = [];
        
        //loops checkActors and grab the hex value of each index of the array then change the hexstring into an objectId and push into actors array
        //ObjectId is imported from mongodb module
        guaranteedcheckActorArray.forEach((actor) => {
            actors.push(ObjectId.createFromHexString(actor));
        });

        //all text is considered a string so we need to parseInt for fields that expects an int
        const show = {
            title: req.body.title,
            numberOfSeasons: parseInt(req.body.seasons),
            firstEpisodeYear: parseInt(req.body.year),
            topActors: actors
        };
        
        await database.collection('Shows').insertOne(show);
        res.render('message', { message: "Success: Show Inserted" });
    }
    catch (e) {
        console.dir(e, {depth: null});
        res.render('message', { message: `${e}`});
    }
};

//get json object of all shows and display the json
const getShowsJSON = async (req, res) => {

    //grabs database connection via req
    const database = req.app.locals.database;

    try {
        const showsJson = await database.collection('Shows').aggregate(
            [
                {
                    $lookup: {
                        from: "Actors",             //looks for data in actors collection
                        localField: 'topActors',    //using the topActor key in shows collection
                        foreignField: '_id',        //to match with _id key in actors collection
                        as: 'topActors'             //and name the matched field topActors
                    }
                },
                {   
                    //manually state how the json is layed out. otherwise, will default to the default layout
                    //_id is by default included so if we want to exclude it we would set it to 0 or false
                    //any other field not explicitly state to be true or worked with will be excluded
                    $project: {
                        title: true,
                        numberOfSeasons: true,
                        firstEpisodeYear: true,
                        topActors: {
                            //here we map out topActors to exclude the _id key/value pair
                            //basically like topActors.map(actor => actor.name) but within mongodb syntax
                            $map: {
                                input: "$topActors",    //maps the topActors array
                                as: "actor",            //names the iterator element actor
                                in: "$$actor.name"      //grab actor.name   note:$$ is required because we are referencing a local variable within map
                            }
                        }
                    }
                }
            ]
        ).toArray();

        console.log(showsJson);

        res.json(showsJson);
    }
    catch (e) {
        console.error(e);
        res.render('message', { message: "Something Unexpected Happened"});
    }
};

export { addShow, getShowsJSON };