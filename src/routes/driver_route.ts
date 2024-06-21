import { Router } from 'express';
import { DriverController } from '../controllers/driver_controller';

const router = Router();

router.get('/salary/driver/list', DriverController.getDriverSalaries);

export default router;
