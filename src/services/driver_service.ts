import { Prisma, PrismaClient } from '@prisma/client';
import { DriverSalaryInterface } from '../utils/types';
const prisma = new PrismaClient();


export class DriverService {
    static async getDriverSalaries( month: number,
        year: number,
        limit: number = 10,
        current: number = 1,
        driver_code: string,
        status: string,
        name: string) 
    {
        if (!month || !year) {
           return { error: true, message: 'Month and year are required.', code: 400}
        }

        const offset = (current - 1) * limit;

        try {

            
            const attendanceSalaryConfig = await prisma.variable_configs.findUnique({
                where: {
                    key: "DRIVER_MONTHLY_ATTENDANCE_SALARY"
                }
            });

            const attendanceSalary = attendanceSalaryConfig?.value || 0;

            
            const driverCodeCondition = driver_code ? Prisma.sql`AND d.driver_code = ${driver_code}` : Prisma.empty;
            const nameCondition =  name ? Prisma.sql`AND d.name ILIKE ${'%' + name + '%'}` : Prisma.empty;
            const statusCondition = status ? Prisma.sql`HAVING (
                ${status === 'PENDING' ? Prisma.sql`SUM(CASE WHEN sc.cost_status = 'PENDING' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) > 0` : Prisma.empty}
                ${status === 'CONFIRMED' ? Prisma.sql`SUM(CASE WHEN sc.cost_status = 'CONFIRMED' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) > 0` : Prisma.empty}
                ${status === 'PAID' ? Prisma.sql`SUM(CASE WHEN sc.cost_status = 'PAID' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) > 0 AND SUM(CASE WHEN sc.cost_status = 'CONFIRMED' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) = 0 AND SUM(CASE WHEN sc.cost_status = 'PENDING' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) = 0` : Prisma.empty}
            )` : Prisma.empty;
            const sqlQuery = Prisma.sql`SELECT 
                                d.driver_code,
                                d.name,
                                SUM(CASE WHEN sc.cost_status = 'PENDING' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) AS total_pending,
                                SUM(CASE WHEN sc.cost_status = 'CONFIRMED' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) AS total_confirmed,
                                SUM(CASE WHEN sc.cost_status = 'PAID' AND s.shipment_status != 'CANCELLED' THEN sc.total_costs ELSE 0 END) AS total_paid,
                                SUM(CASE WHEN s.shipment_status != 'CANCELLED' THEN 1 ELSE 0 END) AS count_shipment,
                                (
                                    SELECT SUM(${attendanceSalary}) FROM driver_attendances da WHERE EXTRACT(MONTH FROM da.attendance_date) = ${month} AND EXTRACT(YEAR FROM da.attendance_date) = ${year} AND da.driver_code = d.driver_code and da.attendance_status = true
                                ) as total_attendance_salary
                            FROM drivers d
                            LEFT JOIN shipment_costs sc ON  d.driver_code = sc.driver_code
                            LEFT JOIN shipments s ON s.shipment_no = sc.shipment_no
                            WHERE 
                            EXTRACT(MONTH FROM s.shipment_date) = ${month} AND EXTRACT(YEAR FROM s.shipment_date) = ${year}
                            ${driverCodeCondition}
                            ${nameCondition}
                            GROUP BY d.driver_code, d.name
                            ${statusCondition}
                            ORDER BY d.driver_code
                            LIMIT ${limit} OFFSET ${offset}`;

                             
            const results = await prisma.$queryRaw<DriverSalaryInterface[]>(sqlQuery);


            const sqlTotalQuery = Prisma.sql`SELECT COUNT(*) as total_row FROM (SELECT distinct d.driver_code AS total_row
                                    FROM drivers d
                                    LEFT JOIN shipment_costs sc ON  d.driver_code = sc.driver_code
                                    LEFT JOIN shipments s ON s.shipment_no = sc.shipment_no
                                    WHERE EXTRACT(MONTH FROM s.shipment_date) = ${month} AND EXTRACT(YEAR FROM s.shipment_date) = ${year}
                                    ${driverCodeCondition}
                                    ${nameCondition}
                                    GROUP BY d.driver_code
                                    ${statusCondition})`;
        

            

            const totalDrivers = await prisma.$queryRaw<{ total_row: number }[]>(sqlTotalQuery);

            return {
                data: results.map(row => {

                    return {
                        ...row,
                        count_shipment: Number(row.count_shipment),
                        total_pending:  Number(row.total_pending),
                        total_confirmed:  Number(row.total_confirmed),
                        total_paid: Number(row.total_paid) ,
                        total_attendance_salary: Number(row.total_attendance_salary),
                        total_salary: Number(row.total_pending) + Number(row.total_confirmed) + Number(row.total_paid) + Number(row.total_attendance_salary),
                    }
                }),
                total_row: Number(totalDrivers[0]?.total_row || 0),
                current: current,
                page_size: limit,
            }
            
        
        } catch (err) {
            console.error(err)
            let message = ""
            if (err instanceof Error) message = err.message
            else message = "Unknown Error"

            return { error: true, message:`Error fetching driver salaries: ${message}` , code: 500}
        }
    
    }
}
