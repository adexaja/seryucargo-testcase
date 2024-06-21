interface DriverInterface {
    driver_code: string;
    name: string;
}

interface DriverAttendanceInterface {
    driver_code: string;
    attendance_date: Date;
    attendance_status: string;
}


interface ShipmentInterface {
    shipment_no: string;
    shipment_date: Date;
    shipment_status: string;
}

interface ShipmentCostInterface {
    driver_code: string;
    shipment_no: string;
    total_costs: number;
    cost_status: string;
}

interface VariableConfigInterface {
    key: string;
    value: string;
}

interface DriverSalaryInterface {
    driver_code: string;
    name: string;
    total_pending: number;
    total_confirmed: number;
    total_paid: number;
    total_attendance_salary: number;
    total_salary: number;
    count_shipment: number;
}


export type {
    DriverInterface,
    ShipmentInterface,
    DriverAttendanceInterface,
    ShipmentCostInterface,
    VariableConfigInterface,
    DriverSalaryInterface
}