import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust file name if you chose a different one
const DATA_FILE_PATH = path.join(__dirname, "..", "..", "data", "sales_data.csv");

export function loadSalesData() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(DATA_FILE_PATH)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        console.log(`✅ Loaded ${results.length} sales records from CSV`);
        resolve(results);
      })
      .on("error", (err) => {
        console.error("❌ Error reading CSV:", err);
        reject(err);
      });
  });
}
