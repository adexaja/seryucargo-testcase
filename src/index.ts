import dotenv from 'dotenv';
import express from 'express';
import driverRoutes from './routes/driver_route';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/v1', driverRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});