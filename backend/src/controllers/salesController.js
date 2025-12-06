import { querySales } from "../services/salesService.js";

export function getSales(req, res) {
  try {
    const {
      search,
      regions,
      genders,
      ageMin,
      ageMax,
      categories,
      tags,
      paymentMethods,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      page = "1",
      pageSize = "10"
    } = req.query;

    const allData = req.salesData || [];

    const result = querySales(allData, {
      search,
      regions,
      genders,
      ageMin,
      ageMax,
      categories,
      tags,
      paymentMethods,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10)
    });

    res.json(result);
  } catch (err) {
    console.error("Error in getSales controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
