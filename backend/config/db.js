const mongoose = require('mongoose');

const uri = "mongodb+srv://tirthkapuriya324_db_user:Tirth123456@habitforgecluster.4oti140.mongodb.net/?appName=HabitForgeCluster";

// Create a Mongoose connection options object to set the Stable API version
const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
};

const connectDB = async () => {
  try {
    // Connect the client to the server
    await mongoose.connect(process.env.MONGO_URI || uri, clientOptions);
    
    // Send a ping to confirm a successful connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

module.exports = connectDB;