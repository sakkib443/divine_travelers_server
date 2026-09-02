const mongoose = require('mongoose');

async function migrate() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/aerovista');
        console.log('Connected to DB');

        const result = await mongoose.connection.collection('tours').updateMany(
            { locationType: { $exists: false } },
            { $set: { locationType: 'Domestic' } }
        );
        
        console.log(`Updated ${result.modifiedCount} tours`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
migrate();
