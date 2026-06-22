import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_DB_URI)
.then(async () => {
    console.log("Successfully connected to MongoDB");

    // // Drop stale non-partial unique index on roles.name (if it exists) and
    // // let Mongoose recreate it correctly as a partial index (deletedAt: null).
    // // This fixes E11000 errors that occur when soft-deleted roles share a name
    // // with an active role.
    // try {
    //     const rolesCollection = mongoose.connection.db.collection('roles');
    //     const indexes = await rolesCollection.indexes();
    //     const stale = indexes.find(
    //         idx => idx.name === 'name_1' && !idx.partialFilterExpression
    //     );
    //     if (stale) {
    //         await rolesCollection.dropIndex('name_1');
    //         console.log('roles: dropped stale non-partial name_1 index');
    //     }
    //     // Recreate the correct partial unique index via Mongoose
    //     const Role = mongoose.model('Role');
    //     await Role.syncIndexes();
    //     console.log('roles: indexes synced');
    // } catch (err) {
    //     console.error('roles: index sync failed —', err.message);
    // }
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
