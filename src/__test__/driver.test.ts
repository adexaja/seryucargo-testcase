import { describe, expect, test } from '@jest/globals';
import { DriverService } from '@seryucargo/services/driver_service';

describe('sum module', () => {
  test('get driver without filter', async () => {
    const driverAll = await DriverService.getDriverSalaries(
      3,
      2024,
      1,
      1,
      "",
      "",
      ""
    );

    expect(driverAll).toEqual({
      "data": [
          {
              "driver_code": "DRIVER001",
              "name": "Driver Name 1",
              "total_attendance_salary": 200000,
              "total_confirmed": 4200000,
              "total_paid": 25900000,
              "total_pending": 39100000,
              "total_salary": 69400000,
              "count_shipment": 11
          }
      ],
      "total_row": 35,
      "current": 1,
      "page_size": 1
  });
  });

  test('get driver salary driver 025', async () => {
    const driverSalary025 = await DriverService.getDriverSalaries(
      3,
      2024,
      1,
      1,
      "DRIVER025",
      "",
      ""
    );

    expect(driverSalary025).toEqual({
      "data": [
          {
              "driver_code": "DRIVER025",
              "name": "Driver Name 25",
              "total_attendance_salary": 300000,
              "total_confirmed": 14300000,
              "total_paid": 4000000,
              "total_pending": 18000000,
              "total_salary": 36600000,
              "count_shipment": 9
          }
      ],
      "total_row": 1,
      "current": 1,
      "page_size": 1
    });
  });

  test('get status paid', async () => {
    const driverSalaryPaid = await DriverService.getDriverSalaries(
      3,
      2024,
      1,
      1,
      "",
      "PAID",
      ""
    );

    expect(driverSalaryPaid).toEqual({
      "data": [],
      "total_row": 0,
      "current": 1,
      "page_size": 1
    });
  });

  test('get status confirmed', async () => {
    const driverSalaryConfirmed = await DriverService.getDriverSalaries(
      3,
      2024,
      1,
      1,
      "",
      "CONFIRMED",
      ""
    );

    expect(driverSalaryConfirmed).toEqual({
      "data": [
          {
              "driver_code": "DRIVER001",
              "name": "Driver Name 1",
              "total_attendance_salary": 200000,
              "total_confirmed": 4200000,
              "total_paid": 25900000,
              "total_pending": 39100000,
              "total_salary": 69400000,
              "count_shipment": 11
          }
      ],
      "total_row": 33,
      "current": 1,
      "page_size": 1
    });
  });

  test('get status pending', async () => {
    const driverSalaryPending = await DriverService.getDriverSalaries(
      3,
      2024,
      1,
      1,
      "",
      "PENDING",
      ""
    );

    expect(driverSalaryPending).toEqual({
      "data": [
          {
              "driver_code": "DRIVER001",
              "name": "Driver Name 1",
              "total_attendance_salary": 200000,
              "total_confirmed": 4200000,
              "total_paid": 25900000,
              "total_pending": 39100000,
              "total_salary": 69400000,
              "count_shipment": 11
          }
      ],
      "total_row": 35,
      "current": 1,
      "page_size": 1
    });
  });
});
