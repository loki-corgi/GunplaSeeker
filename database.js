import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();

if (!process.env.CONNECTION) {
    console.error("❌ CONNECTION string is undefined. Check your .env file!");
    process.exit(1);
}

const client = new MongoClient(process.env.CONNECTION);
let connection = client.connect();
const database = client.db('gundam-db');

// Gracefully close connection on keyboard interrupt
process.on('SIGINT', () => {
    client.close();
    console.log("Closed database connection!");
    process.exit(1);
});

export { client, connection };