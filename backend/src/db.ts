import "reflect-metadata";
import { DataSource } from "typeorm";
import { EnvironmentalAssessment } from "./models/Assessment.js";
import { CommunityReport } from "./models/Report.js";
import { config } from "./config/index.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: config.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/herp",
    synchronize: config.NODE_ENV === "development",
    logging: false,
    entities: [EnvironmentalAssessment, CommunityReport],
    migrations: [],
    subscribers: [],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");
    } catch (err) {
        console.error("Error during Data Source initialization", err);
    }
};
