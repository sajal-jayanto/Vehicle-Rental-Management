import { StatusCodes } from "http-status-codes";
import { db } from "../db/knex.js";
import { HttpError } from "../middlewares/error.middleware.js";

interface createVehicleReq {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: string;
  photoPath: string | null;
}

interface findAllReq {
  page: number;
  limit: number;
  category: string | null | undefined;
  search: string | undefined | null;
  offset: number;
}

export class VehicleService {
  async createVehicle({ name, plate_number, category, daily_rate, photoPath }: createVehicleReq) {
    const existingVehicle = await db("vehicles").where("plate_number", plate_number).first();

    if (existingVehicle) {
      throw new HttpError("Vehicle with this plate number already exists", StatusCodes.CONFLICT);
    }

    const [vehicle] = await db("vehicles")
      .insert({
        name,
        plate_number,
        category,
        daily_rate,
        photo_path: photoPath,
      })
      .returning("*");

    return vehicle;
  }

  async findAll({ page, limit, category, search, offset }: findAllReq) {
    const query = db("vehicles").whereNull("deleted_at");

    if (category != "") {
      query.where("category", category);
    }

    if (search != "") {
      query.whereILike("name", `%${search}%`);
    }

    const countResult = await query
      .clone()
      .clearSelect()
      .clearOrder()
      .count<{ count: string }>("id as count")
      .first();

    const vehicles = await query
      .clone()
      .select("*")
      .orderBy("id", "desc")
      .limit(limit)
      .offset(offset);

    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { vehicles, pagination };
  }

  async findOne({ id }: { id: number }) {
    const vehicle = await db("vehicles").where("id", id).whereNull("deleted_at").first();

    if (!vehicle) {
      throw new HttpError("Vehicle not found", StatusCodes.NOT_FOUND);
    }

    return vehicle;
  }

  async deleteVehicle({ id }: { id: number }) {
    const vehicle = await db("vehicles").where("id", id).whereNull("deleted_at").first();

    if (!vehicle) {
      throw new HttpError("Vehicle not found", StatusCodes.NOT_FOUND);
    }

    await db("vehicles").where("id", id).update({
      deleted_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
  }
}
