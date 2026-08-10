import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("rentals", (table) => {
    table.bigIncrements("id").primary();
    table
      .bigInteger("vehicle_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("vehicles")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table.string("customer_name", 255).notNullable();
    table.string("customer_phone", 30).notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.decimal("total_amount", 12, 2).notNullable();
    table
      .enu("status", ["booked", "ongoing", "completed", "cancelled"])
      .notNullable()
      .defaultTo("booked");
      
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index("vehicle_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("rentals");
}
