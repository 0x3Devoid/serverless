const { MongoClient } = require('mongodb')
require('dotenv').config();

const URI = process.env.MONGODB_CONNECTION_STRING;

class DBClient{
    constructor(){
        this.client = new MongoClient(URI)

        try{
            this.client.connect()
            console.log('DATABASE CONNECTED SUCCESSFULLY')
        }catch(err){
            console.log(`Error: ${err}`)
        } finally{
            this.client.close();
        }

        this.db = this.client.db('Chakra');
    }
}

const dbClient = new DBClient();
module.exports = dbClient;

