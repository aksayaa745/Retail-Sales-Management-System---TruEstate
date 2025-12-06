function normalizeString(value) {
  return (value || "").toString().trim().toLowerCase();
}

function parseNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function parseDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function parseMultiSelect(value) {
  if (!value) return null;
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => v.toLowerCase());
}

export function querySales(allData, options) {
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
    sortOrder = "asc",
    page = 1,
    pageSize = 10
  } = options;

  let data = [...allData];

  // --- 1) SEARCH (Customer Name + Phone Number) ---
  if (search && search.trim() !== "") {
    const q = normalizeString(search);
    data = data.filter((row) => {
      const name = normalizeString(row["Customer Name"] || row.customerName);
      const phone = normalizeString(row["Phone Number"] || row.phoneNumber);
      return name.includes(q) || phone.includes(q);
    });
  }

  // --- Prepare filter values ---
  const regionList = parseMultiSelect(regions);
  const genderList = parseMultiSelect(genders);
  const categoryList = parseMultiSelect(categories);
  const tagList = parseMultiSelect(tags);
  const paymentMethodList = parseMultiSelect(paymentMethods);

  const minAge = ageMin ? parseNumber(ageMin) : null;
  const maxAge = ageMax ? parseNumber(ageMax) : null;

  const fromDate = dateFrom ? parseDate(dateFrom) : null;
  const toDate = dateTo ? parseDate(dateTo) : null;

  // --- 2) FILTERS ---
  data = data.filter((row) => {
    const rowRegion = normalizeString(row["Customer Region"] || row.customerRegion);
    const rowGender = normalizeString(row["Gender"] || row.gender);
    const rowCategory = normalizeString(row["Product Category"] || row.productCategory);
    const rowPaymentMethod = normalizeString(row["Payment Method"] || row.paymentMethod);

    const rowAge = parseNumber(row["Age"] || row.age);
    const rowDate = parseDate(row["Date"] || row.date);

    // Regions
    if (regionList && regionList.length > 0 && !regionList.includes(rowRegion)) {
      return false;
    }

    // Gender
    if (genderList && genderList.length > 0 && !genderList.includes(rowGender)) {
      return false;
    }

    // Age range
    if (minAge !== null && (rowAge === null || rowAge < minAge)) {
      return false;
    }
    if (maxAge !== null && (rowAge === null || rowAge > maxAge)) {
      return false;
    }

    // Product Category
    if (categoryList && categoryList.length > 0 && !categoryList.includes(rowCategory)) {
      return false;
    }

    // Tags (comma-separated)
    if (tagList && tagList.length > 0) {
      const rawTags = (row["Tags"] || row.tags || "").toString().toLowerCase();
      const rowTags = rawTags.split(",").map((t) => t.trim());
      const hasAllTags = tagList.every((t) =>
        rowTags.some((rt) => rt.includes(t))
      );
      if (!hasAllTags) return false;
    }

    // Payment Method
    if (paymentMethodList && paymentMethodList.length > 0 && !paymentMethodList.includes(rowPaymentMethod)) {
      return false;
    }

    // Date range
    if (fromDate && (!rowDate || rowDate < fromDate)) {
      return false;
    }
    if (toDate && (!rowDate || rowDate > toDate)) {
      return false;
    }

    return true;
  });

  // --- 3) SORTING ---
  if (sortBy) {
    const order = sortOrder === "desc" ? -1 : 1;

    data.sort((a, b) => {
      if (sortBy === "date") {
        const da = parseDate(a["Date"] || a.date);
        const db = parseDate(b["Date"] || b.date);
        if (!da && !db) return 0;
        if (!da) return -1 * order;
        if (!db) return 1 * order;
        return (da - db) * order;
      }

      if (sortBy === "quantity") {
        const qa = parseNumber(a["Quantity"] || a.quantity) || 0;
        const qb = parseNumber(b["Quantity"] || b.quantity) || 0;
        return (qa - qb) * order;
      }

      if (sortBy === "customerName") {
        const na = normalizeString(a["Customer Name"] || a.customerName);
        const nb = normalizeString(b["Customer Name"] || b.customerName);
        if (na < nb) return -1 * order;
        if (na > nb) return 1 * order;
        return 0;
      }

      return 0;
    });
  }

  // --- 4) PAGINATION ---
  const totalItems = data.length;
  const safePage = page && page > 0 ? page : 1;
  const safePageSize = pageSize && pageSize > 0 ? pageSize : 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  const startIndex = (safePage - 1) * safePageSize;
  const paginatedData = data.slice(startIndex, startIndex + safePageSize);

  return {
    data: paginatedData,
    meta: {
      totalItems,
      totalPages,
      currentPage: safePage,
      pageSize: safePageSize
    }
  };
}
