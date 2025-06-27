const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahilaps2k12:sdf8bQFxKaeSTUB7@cluster0.clvp4at.mongodb.net/';
const DB_NAME = 'goalTracker';

let db;

// Connect to MongoDB with updated options
const connectToMongoDB = async () => {
    try {
        const client = await MongoClient.connect(MONGODB_URI, {
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            },
            tlsInsecure: false,
            ssl: true
        });

        console.log('Connected to MongoDB successfully');
        db = client.db(DB_NAME);

        // Test the connection
        await db.admin().ping();
        console.log('MongoDB ping successful');

    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Continuing without MongoDB - some features may not work');
        // Set db to null so we can handle it gracefully
        db = null;
    }
};

// Initialize MongoDB connection
connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Save a goal
app.post('/api/goals', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database connection not available' });
        }

        const goal = req.body;
        const collection = db.collection('goals');

        await collection.replaceOne(
            { id: goal.id, userId: goal.userId },
            goal,
            { upsert: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving goal:', error);
        res.status(500).json({ error: 'Failed to save goal' });
    }
});

// Get goals for a specific user and date
app.get('/api/goals/:userId/:date', async (req, res) => {
    try {
        if (!db) {
            return res.status(503).json({ error: 'Database connection not available' });
        }

        const { userId, date } = req.params;
        const collection = db.collection('goals');

        const goals = await collection.find({
            userId,
            $or: [
                { date },
                {
                    $and: [
                        { startDate: { $lte: date } },
                        { endDate: { $gte: date } }
                    ]
                }
            ]
        }).toArray();

        res.json({ goals });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Update a goal
app.put('/api/goals/:goalId', async (req, res) => {
    try {
        const { goalId } = req.params;
        const goal = req.body;
        const collection = db.collection('goals');

        await collection.updateOne(
            { id: goalId, userId: goal.userId },
            { $set: goal }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// Delete a goal
app.delete('/api/goals/:goalId', async (req, res) => {
    try {
        const { goalId } = req.params;
        const { userId } = req.body;
        const collection = db.collection('goals');

        await collection.deleteOne({ id: goalId, userId });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// Get all user data
app.get('/api/user-data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const goalsCollection = db.collection('goals');
        const dayDataCollection = db.collection('dayData');

        const goals = await goalsCollection.find({ userId }).toArray();
        const dayData = await dayDataCollection.find({ userId }).toArray();

        // Format data to match the expected structure
        const formattedData = {};

        // Process day data
        dayData.forEach(day => {
            formattedData[day.date] = {
                date: day.date,
                goals: goals.filter(goal => {
                    const goalStart = new Date(goal.startDate);
                    const goalEnd = new Date(goal.endDate);
                    const checkDate = new Date(day.date);
                    return checkDate >= goalStart && checkDate <= goalEnd;
                }),
                totalLoggedHours: day.totalLoggedHours || 0,
                completedGoals: day.completedGoals || 0
            };
        });

        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Save day data
app.post('/api/day-data', async (req, res) => {
    try {
        const dayData = req.body;
        const collection = db.collection('dayData');

        await collection.replaceOne(
            { date: dayData.date, userId: dayData.userId },
            dayData,
            { upsert: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving day data:', error);
        res.status(500).json({ error: 'Failed to save day data' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const status = {
        status: 'OK',
        message: 'Goal Tracker API is running',
        mongodb: db ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    };
    res.json(status);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 