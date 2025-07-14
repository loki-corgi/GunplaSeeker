//routes for adding model into database
const addModel = async (req, res) => {
    try {
        const database = req.apps.locals.database;

        const model = {
            //set date to be start of date to only care about the day, month, year. might be useful if we want do something with the database that needs it
            dateAdded: new Date().setUTCHours(0,0,0,0),
            modelName: res.body.modelName,
            modelGrade: res.body.modelGrade,
            price: req.body.price,
            streetNumber: req.body.streetNumber,
            streetName: req.body.streetName,
            city: req.body.city,
            province: req.body.province
        };  

        await database.collection("gundam-models").insertOne(model);
        res.render('index'  , { message: `Successfully added ${model.name}` });
    }
    catch (e) {
        console.dir(e, {depth: null});
        res.render('error', { message: 'One or more fields are invalid' });
    }
};

export { addModel };