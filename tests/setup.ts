import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

beforeAll(async () => {
    // Connect to a test database
    // Ensure you have a separate test DB or use MongoMemoryServer
    const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/pos_multitenant_test';
    await mongoose.connect(mongoURI);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    // Optional: Clear collections between tests
    // const collections = mongoose.connection.collections;
    // for (const key in collections) {
    //     await collections[key].deleteMany({});
    // }
});
