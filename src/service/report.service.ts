import { StatusCodes } from "http-status-codes";
import { HttpError } from "../middlewares/error.middleware.js";
import { db } from "../db/knex.js";

interface RentalReportQuery {
  month?: string | undefined;
  vehicle_id?: string | undefined;
}

export class ReportService {
  async generateReport({ month, vehicle_id }: RentalReportQuery) {
    const reportMonth = month ?? new Date().toISOString().slice(0, 7);

    if (!/^\d{4}-\d{2}$/.test(reportMonth)) {
      throw new HttpError("Invalid month format. Use YYYY-MM", StatusCodes.BAD_REQUEST);
    }

    const monthStart = `${reportMonth}-01`;
    const [year, monthNumber] = reportMonth.split("-").map(Number);

    const nextMonth =
      monthNumber === 12
        ? `${Number(year) + 1}-01-01`
        : `${year}-${String(Number(monthNumber) + 1).padStart(2, "0")}-01`;
    const monthEnd = new Date(`${nextMonth}T00:00:00Z`);

    monthEnd.setUTCDate(monthEnd.getUTCDate() - 1);
    const monthEndString = monthEnd.toISOString().slice(0, 10);

    const query = db("rentals")
      .join("vehicles", "rentals.vehicle_id", "vehicles.id")
      .where("rentals.status", "!=", "cancelled")
      .where("rentals.start_date", "<=", monthEndString)
      .where("rentals.end_date", ">=", monthStart);

    if (vehicle_id) {
      query.where("rentals.vehicle_id", vehicle_id);
    }

    const rentals = await query.select(
      "rentals.id",
      "rentals.vehicle_id",
      "rentals.start_date",
      "rentals.end_date",
      "rentals.total_amount",
      "vehicles.name",
      "vehicles.daily_rate",
    );

    const reportMap = new Map<
      number,
      { id: number; name: string; total_bookings: number; days_rented: number; revenue: number }
    >();

    for (const rental of rentals) {
      const rentalStart = rental.start_date > monthStart ? rental.start_date : monthStart;
      const rentalEnd = rental.end_date < monthEndString ? rental.end_date : monthEndString;

      const start = new Date(`${rentalStart}T00:00:00Z`);
      const end = new Date(`${rentalEnd}T00:00:00Z`);
      const daysRented = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const revenue = Number(rental.daily_rate) * daysRented;

      if (!reportMap.has(rental.vehicle_id)) {
        reportMap.set(rental.vehicle_id, {
          id: rental.vehicle_id,
          name: rental.name,
          total_bookings: 0,
          days_rented: 0,
          revenue: 0,
        });
      }

      const vehicleReport = reportMap.get(rental.vehicle_id)!;
      vehicleReport.total_bookings += 1;
      vehicleReport.days_rented += daysRented;
      vehicleReport.revenue += revenue;
    }

    const vehicles = Array.from(reportMap.values());
    const highestRevenueVehicle =
      vehicles.length > 0
        ? vehicles.reduce((highest, current) =>
            current.revenue > highest.revenue ? current : highest,
          )
        : null;

    return {
      month: reportMonth,
      vehicles,
      highest_revenue_vehicle: highestRevenueVehicle,
    };
  }
}
