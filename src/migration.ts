import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Client } from 'pg';
import { DriverAttendanceInterface, DriverInterface, ShipmentCostInterface, ShipmentInterface, VariableConfigInterface } from '@seryucargo/utils/types';


import dotenv from 'dotenv';

dotenv.config();


const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

const migrationDir: string = __dirname + "/migration"
const seedDir: string = __dirname + "/seed"

async function createTables() {
  const filePath = path.join(migrationDir, 'migration.sql');
  const sql = fs.readFileSync(filePath, 'utf8');

  await client.query(sql);
}

// Helper function to seed data into the database
async function seedData(tableName: string, data: any[], query: string) {
  for (const row of data) {
    await client.query(query, Object.values(row));
  }
  console.log(`Data successfully seeded into ${tableName}`);
}

// Function to read CSV and return a promise that resolves with the data
function readCSV(filePath: string, dataArray: any[]) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => dataArray.push(data))
      .on('end', () => resolve(dataArray))
      .on('error', (error) => reject(error));
  });
}

async function seedAllData() {
  const driverData: DriverInterface[] = [];
  const shipmentData: ShipmentInterface[] = [];
  const driverAttendanceData: DriverAttendanceInterface[] = [];
  const shipmentCostData: ShipmentCostInterface[] = [];
  const variableConfigData: VariableConfigInterface[] = [];
  try {
    // Load initial data concurrently
    await Promise.all([
      readCSV(path.join(seedDir, 'drivers.csv'), driverData),
      readCSV(path.join(seedDir, 'shipments.csv'), shipmentData),
      readCSV(path.join(seedDir, 'variable_configs.csv'), variableConfigData),
    ]);

    // Seed initial data concurrently
    await Promise.all([
      seedData('drivers', driverData, 'INSERT INTO drivers (id, driver_code, name) VALUES ($1, $2, $3)'),
      seedData('shipments', shipmentData, 'INSERT INTO shipments (shipment_no, shipment_date, shipment_status) VALUES ($1, $2, $3)'),
      seedData('variable_configs', variableConfigData, 'INSERT INTO variable_configs (key, value) VALUES ($1, $2)'),
    ]);

    // Load dependent data
    await readCSV(path.join(seedDir, 'driver_attendances.csv'), driverAttendanceData);
    await readCSV(path.join(seedDir, 'shipment_costs.csv'), shipmentCostData);

    // Seed dependent data sequentially
    await seedData('driver_attendances', driverAttendanceData, 'INSERT INTO driver_attendances (id, driver_code, attendance_date, attendance_status) VALUES ($1, $2, $3, $4)');
    await seedData('shipment_costs', shipmentCostData, 'INSERT INTO shipment_costs (id, driver_code, shipment_no, total_costs, cost_status) VALUES ($1, $2, $3, $4, $5)');

    console.log('All data successfully seeded');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close the client connection after all seeding is done
    client.end();
  }
}

createTables().then(() => {
  seedAllData();
})

