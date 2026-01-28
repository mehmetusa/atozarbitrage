import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new MongoClient(process.env.MONGO_URL);

async function copyDatabase(sourceDbName, targetDbName) {
  try {
    await client.connect();

    const sourceDb = client.db(sourceDbName);
    const targetDb = client.db(targetDbName);

    // Get all collections from source DB
    const collections = await sourceDb.listCollections().toArray();

    if (!collections.length) {
      console.log('No collections found in source database');
      return;
    }

    for (const coll of collections) {
      const collectionName = coll.name;
      const sourceColl = sourceDb.collection(collectionName);
      const targetColl = targetDb.collection(collectionName);

      const docs = await sourceColl.find({}).toArray();

      if (docs.length) {
        // Optionally: clear target collection first
        // await targetColl.deleteMany({});
        await targetColl.insertMany(docs);
        console.log(`Copied ${docs.length} documents from "${collectionName}"`);
      } else {
        console.log(`No documents in "${collectionName}"`);
      }
    }

    console.log(`✅ All collections copied from "${sourceDbName}" → "${targetDbName}"`);
  } catch (err) {
    console.error('Error copying database:', err);
  } finally {
    await client.close();
  }
}

// Example usage
copyDatabase('test', 'noordonProduction');
