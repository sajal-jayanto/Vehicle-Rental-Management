import { StatusCodes } from "http-status-codes";
import { db } from "../db/knex.js";
import { HttpError } from "../middlewares/error.middleware.js";
import { calculateRentalDays } from "../utils/healper.js";

export interface CreateRentalRequest {
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface EditRentalRequest extends CreateRentalRequest {
  id: number;
  status: string;
}

interface GetRentalsQuery {
  page?: number;
  limit?: number;
  vehicle_id?: string;
  status?: string;
  start_date?: unknown;
  end_date?: unknown;
}

export class RentalService {
  async createVehicleRental({
    vehicle_id,
    customer_name,
    customer_phone,
    start_date,
    end_date,
  }: CreateRentalRequest) {
    const vehicle = await db("vehicles").where("id", vehicle_id).first();

    if (!vehicle) {
      throw new HttpError("Vehicle not found", StatusCodes.NOT_FOUND);
    }

    const overlappingRental = await db("rentals")
      .where("vehicle_id", vehicle_id)
      .whereIn("status", ["booked", "ongoing"])
      .where("start_date", "<=", end_date)
      .where("end_date", ">=", start_date)
      .first();

    if (overlappingRental) {
      throw new HttpError("Vehicle is already rented for the selected dates", StatusCodes.CONFLICT);
    }

    const numberOfDays = calculateRentalDays(start_date, end_date);

    const totalAmount = Number(vehicle.daily_rate) * numberOfDays;

    const [rental] = await db("rentals")
      .insert({
        vehicle_id,
        customer_name,
        customer_phone,
        start_date,
        end_date,
        total_amount: totalAmount,
        status: "booked",
      })
      .returning([
        "id",
        "vehicle_id",
        "customer_name",
        "customer_phone",
        "start_date",
        "end_date",
        "total_amount",
        "status",
        "created_at",
        "updated_at",
      ]);

    return rental;
  }

  async findOne({ id }: { id: number }) {
    const rental = await db("rentals")
      .where("rentals.id", id)
      .join("vehicles", "rentals.vehicle_id", "vehicles.id")
      .select(
        "rentals.*",
        "vehicles.name as vehicle_name",
        "vehicles.plate_number",
        "vehicles.category",
        "vehicles.daily_rate",
      )
      .first();

    if (!rental) {
      throw new HttpError("Rental not found", StatusCodes.NOT_FOUND);
    }

    return rental;
  }

  async findAll({
    page = 1,
    limit = 10,
    vehicle_id,
    status,
    start_date,
    end_date,
  }: GetRentalsQuery) {
    const offset = (page - 1) * limit;
    const query = db("rentals")
      .join("vehicles", "rentals.vehicle_id", "vehicles.id")
      .select("rentals.*", "vehicles.name as vehicle_name", "vehicles.plate_number");

    if (vehicle_id != "") {
      query.where("rentals.vehicle_id", vehicle_id);
    }

    if (status != "") {
      query.where("rentals.status", status);
    }

    if (start_date) {
      query.where("rentals.start_date", ">=", start_date);
    }

    if (end_date) {
      query.where("rentals.end_date", "<=", end_date);
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .clearOrder()
      .count<{ count: string }>("rentals.id as count")
      .first();

    const count = Number(countResult?.count ?? 0);

    const rentals = await query.orderBy("rentals.created_at", "desc").limit(limit).offset(offset);

    return {
      data: rentals,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async deleteRental({ id }: { id: number }) {
    const deleted = await db("rentals").where("id", id).delete();

    if (!deleted) {
      throw new HttpError("Rental not found", StatusCodes.NOT_FOUND);
    }
  }

  async editRental({
    id,
    vehicle_id,
    customer_name,
    customer_phone,
    start_date,
    end_date,
    status,
  }: EditRentalRequest) {
    const existingRental = await db("rentals").where("id", id).first();

    if (!existingRental) {
      throw new HttpError("Rental not found", StatusCodes.NOT_FOUND);
    }

    const newVehicleId = vehicle_id ?? existingRental.vehicle_id;
    const newStartDate = start_date ?? existingRental.start_date;
    const newEndDate = end_date ?? existingRental.end_date;

    if (newStartDate > newEndDate) {
      throw new HttpError("Start date cannot be after end date", StatusCodes.BAD_REQUEST);
    }

    const vehicle = await db("vehicles").where("id", newVehicleId).first();

    if (!vehicle) {
      throw new HttpError("Vehicle not found", StatusCodes.NOT_FOUND);
    }

    const overlappingRental = await db("rentals")
      .where("vehicle_id", newVehicleId)
      .whereIn("status", ["booked", "ongoing"])
      .where("id", "!=", id)
      .where("start_date", "<=", newEndDate)
      .where("end_date", ">=", newStartDate)
      .first();

    if (overlappingRental) {
      throw new HttpError("Vehicle is already rented for the selected dates", StatusCodes.CONFLICT);
    }

    const numberOfDays = calculateRentalDays(newStartDate, newEndDate);
    const totalAmount = Number(vehicle.daily_rate) * numberOfDays;

    const updateData = {
      vehicle_id: newVehicleId,
      customer_name: customer_name ?? existingRental.customer_name,
      customer_phone: customer_phone ?? existingRental.customer_phone,
      start_date: newStartDate,
      end_date: newEndDate,
      total_amount: totalAmount,
      status: status ?? existingRental.status,
      updated_at: db.fn.now(),
    };

    const [rental] = await db("rentals")
      .where("id", id)
      .update(updateData)
      .returning([
        "id",
        "vehicle_id",
        "customer_name",
        "customer_phone",
        "start_date",
        "end_date",
        "total_amount",
        "status",
        "created_at",
        "updated_at",
      ]);

    return rental;
  }
}
