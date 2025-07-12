//add new actor into database
const addActor = async (req, res) => {

    const database = req.app.locals.database;

    try {
        const actor = {
            name: req.body.actorName,
        };
        
        await database.collection('Actors').insertOne(actor);
        res.render('message', { message: "Success: Actor Inserted" });
    }
    catch (e) {
        console.dir(e, {depth: null});
        res.render('message', { message: `${e}`});
    }

};

export { addActor };