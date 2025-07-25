import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
dotenv.config();

//technically not needed but good coding practice
if (!process.env.CONNECTION) {
    console.error("❌ CONNECTION string is undefined. Check your .env file!");
    process.exit(1);
}

const client = new MongoClient(process.env.CONNECTION, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Close db connection
process.on('SIGINT', ()=>{
  client.close();
  console.log("closed database connection");
  process.exit(1);
})

const connection = client.connect();
const database = client.db('gundam-db'); 

export { connection, database };