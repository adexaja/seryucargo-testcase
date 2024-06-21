import { Request, Response } from 'express';
import { DriverService } from '../services/driver_service';
import { json } from '../utils/helpers';

export class DriverController {
    static async getDriverSalaries(req: Request, res: Response) {
        const {  
            month,
            year,
            page_size = 10,
            current = 1,
            driver_code,
            status,
            name
         } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: false, message: 'Year and month are required', code: 400});
        }

        const driverSalaries = await DriverService.getDriverSalaries(
            Number(month || 0),
            Number(year || 0),
            Number(page_size || 0),
            Number(current || 0),
            driver_code as string || '',
            status  as string  || '',
            name  as string  || '',
        );


        return res.status(200).header({
            "Content-Type": "application/json"
        }).send(json(driverSalaries));
    }
}
