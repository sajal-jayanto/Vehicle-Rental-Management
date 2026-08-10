import { db } from "../db/knex.js";
import bcrypt from "bcrypt";
import { HttpError } from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}


export class AuthService {
  async registerStaff({ email, password, name }: RegisterInput) {
    
    const existingStaff = await db("staff")
      .where({ email })
      .first();

    if (existingStaff) {
      throw new HttpError(`Email already registered`, StatusCodes.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [staff] = await db("staff")
      .insert({ email, password_hash: passwordHash, name })
      .returning([ "id", "email", "name", "created_at", "updated_at" ]);

    return staff;
  }

  async login({ email, password }: LoginInput) {
    const staff = await db("staff")
      .where({ email })
      .first();

    if (!staff) {
      throw new HttpError(`Invalid email address`, StatusCodes.NOT_FOUND);
    }

    const passwordMatched = await bcrypt.compare(
      password,
      staff.password_hash,
    );

    if (!passwordMatched) {
      throw new HttpError(`Invalid password`, StatusCodes.NOT_FOUND);
    }

    const staffInfo = {
      id: staff.id,
      email: staff.email,
      name: staff.name,
    }

    const token = jwt.sign(staffInfo, env.JWT_SECRET, { expiresIn: '1d' } );
    
    return {
      staff: staffInfo,
      token,
    };
  }
}