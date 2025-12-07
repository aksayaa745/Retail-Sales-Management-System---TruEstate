import { useEffect, useState, useRef } from "react";
import "./App.css";

// Base URL for backend API (Render in production, localhost in dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  // Data + paging
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Network + UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search + sort
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("customerName_asc");
  const [sortBy, setSortBy] = useState("customerName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filters
  const [regions, setRegions] = useState([]);
  const [genders, setGenders] = useState([]);
  const [ageRange, setAgeRange] = useState(""); // e.g. "18-25"
  const [categoryText, setCategoryText] = useState("");
  const [tags, setTags] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [dateRange, setDateRange] = useState(""); // e.g. "2023-10"

  // header controls
  const [reloadCounter, setReloadCounter] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  // sidebar collapse
  const [openServices, setOpenServices] = useState(false);
  const [openInvoices, setOpenInvoices] = useState(false);

  // popover state
  const [regionOpen, setRegionOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // refs for outside click
  const moreRef = useRef(null);
  const regionRef = useRef(null);
  const genderRef = useRef(null);
  const ageRef = useRef(null);
  const categoryRef = useRef(null);
  const tagsRef = useRef(null);
  const paymentRef = useRef(null);
  const dateRef = useRef(null);

  const handleSingleSelect = (value, setter) => {
    if (!value) setter([]);
    else setter([value]);
    setPage(1);
  };

  function updateSortFromValue(value) {
    setSortValue(value);
    if (!value) {
      setSortBy("");
      setSortOrder("asc");
      setPage(1);
      return;
    }
    const [field, order] = value.split("_");
    if (field === "date") setSortBy("date");
    else if (field === "quantity") setSortBy("quantity");
    else if (field === "customerName") setSortBy("customerName");
    else if (field === "productCategory") setSortBy("productCategory");
    else setSortBy("");
    setSortOrder(order === "desc" ? "desc" : "asc");
    setPage(1);
  }

  // fetch data
  useEffect(() => {
    let cancelled = false;

    async function fetchTransactions() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        if (search.trim() !== "") params.set("search", search.trim());
        if (sortBy) {
          params.set("sortBy", sortBy);
          params.set("sortOrder", sortOrder);
        }
        if (regions.length > 0) params.set("regions", regions.join(","));
        if (genders.length > 0) params.set("genders", genders.join(","));
        if (ageRange) params.set("ageRange", ageRange);
        if (categoryText.trim() !== "") params.set("categories", categoryText.trim());
        if (tags.length > 0) params.set("tags", tags.join(","));
        if (paymentMethods.length > 0) params.set("paymentMethods", paymentMethods.join(","));
        if (dateRange) params.set("dateRange", dateRange);

        const res = await fetch(`${API_BASE_URL}/api/sales?${params.toString()}`);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Failed to fetch sales data");
        }
        const json = await res.json();
        if (!cancelled) {
          setTransactions(json.data || []);
          setMeta(json.meta || {});
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTransactions();
    return () => {
      cancelled = true;
    };
  }, [
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    regions,
    genders,
    ageRange,
    categoryText,
    tags,
    paymentMethods,
    dateRange,
    reloadCounter,
  ]);

  // outside click to close popovers
  useEffect(() => {
    function onDocClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (regionRef.current && !regionRef.current.contains(e.target)) setRegionOpen(false);
      if (genderRef.current && !genderRef.current.contains(e.target)) setGenderOpen(false);
      if (ageRef.current && !ageRef.current.contains(e.target)) setAgeOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
      if (tagsRef.current && !tagsRef.current.contains(e.target)) setTagsOpen(false);
      if (paymentRef.current && !paymentRef.current.contains(e.target)) setPaymentOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
    }
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") setPage(1);
  };

  const handlePageClick = (newPage) => {
    if (newPage >= 1 && newPage <= (meta.totalPages || 1)) setPage(newPage);
  };

  const buildPageNumbers = () => {
    const totalPages = meta.totalPages || 1;
    const current = meta.currentPage || page || 1;
    const maxToShow = 6;
    const pages = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + maxToShow - 1);
    if (end - start < maxToShow - 1) start = Math.max(1, end - maxToShow + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // KPIs for current page
  const totalUnitsPage = transactions.reduce((sum, row) => {
    const q = Number(row["Quantity"] || row.quantity || 0);
    return sum + (Number.isNaN(q) ? 0 : q);
  }, 0);

  const totalAmountPage = transactions.reduce((sum, row) => {
    const v = Number(row["Final Amount"] || row.finalAmount || 0);
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  const exportCurrentPageCSV = () => {
    const keys = Object.keys(transactions[0] || {});
    if (keys.length === 0) {
      alert("No data to export on this page.");
      return;
    }
    const csvRows = [keys.join(",")];
    transactions.forEach((r) =>
      csvRows.push(keys.map((k) => `"${(r[k] ?? "").toString().replace(/"/g, '""')}"`).join(","))
    );
    const csvStr = csvRows.join("\n");
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_page_${meta.currentPage || page}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMoreOpen(false);
  };

  const displayOrAll = (list, fallback = "All") =>
    list.length === 0 ? fallback : list.join(", ");

  return (
    <div className="app-window">
      <div className="app-shell">
        {/* SIDEBAR (narrow) */}
        <aside className="sidebar">
          <div className="vault-card">
            <div className="vault-logo-circle">V</div>
            <div className="vault-text">
              <div className="vault-title">Vault</div>
              <div className="vault-user">Anurag Yadav</div>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            <div className="sidebar-section">
              <button className="sidebar-section-title btn-like">
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">Dashboard</span>
              </button>
            </div>

            <div className="sidebar-section">
              <button className="sidebar-section-title btn-like">
                <span className="sidebar-icon">🧩</span>
                <span className="sidebar-text">Nexus</span>
              </button>
            </div>

            <div className="sidebar-section">
              <button className="sidebar-section-title btn-like">
                <span className="sidebar-icon">📥</span>
                <span className="sidebar-text">Intake</span>
              </button>
            </div>

            <div className="sidebar-section">
              <button
                className={
                  "sidebar-section-title btn-like with-chevron " +
                  (openServices ? "is-open" : "")
                }
                onClick={() => setOpenServices((s) => !s)}
                aria-expanded={openServices}
                aria-controls="services-sublist"
              >
                <span className="sidebar-icon">🛠️</span>
                <span className="sidebar-text">Services</span>
                <span className="chev">{openServices ? "▾" : "▸"}</span>
              </button>
              <ul
                id="services-sublist"
                className={
                  "sidebar-sublist collapse " + (openServices ? "open" : "")
                }
                role="menu"
                aria-hidden={!openServices}
              >
                <li role="menuitem" tabIndex={openServices ? 0 : -1}>
                  <button className="sublist-item">Pre-active</button>
                </li>
                <li role="menuitem" tabIndex={openServices ? 0 : -1}>
                  <button className="sublist-item is-active">Active</button>
                </li>
                <li role="menuitem" tabIndex={openServices ? 0 : -1}>
                  <button className="sublist-item">Blocked</button>
                </li>
                <li role="menuitem" tabIndex={openServices ? 0 : -1}>
                  <button className="sublist-item">Closed</button>
                </li>
              </ul>
            </div>

            <div className="sidebar-section">
              <button
                className={
                  "sidebar-section-title btn-like with-chevron " +
                  (openInvoices ? "is-open" : "")
                }
                onClick={() => setOpenInvoices((s) => !s)}
                aria-expanded={openInvoices}
                aria-controls="invoices-sublist"
              >
                <span className="sidebar-icon">📄</span>
                <span className="sidebar-text">Invoices</span>
                <span className="chev">{openInvoices ? "▾" : "▸"}</span>
              </button>
              <ul
                id="invoices-sublist"
                className={
                  "sidebar-sublist collapse " + (openInvoices ? "open" : "")
                }
                role="menu"
                aria-hidden={!openInvoices}
              >
                <li role="menuitem" tabIndex={openInvoices ? 0 : -1}>
                  <button className="sublist-item">Proforma Invoices</button>
                </li>
                <li role="menuitem" tabIndex={openInvoices ? 0 : -1}>
                  <button className="sublist-item">Final Invoices</button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <div className="main-area">
          {/* Title */}
          <div className="title-row">
            <h1>Sales Management System</h1>
          </div>

          {/* Controls panel */}
          <div className="controls-panel">
            <div className="controls-left">
              <button
                className="refresh-pill"
                onClick={() => setReloadCounter((c) => c + 1)}
                title="Refresh"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className={loading ? "spin" : ""}
                  fill="none"
                >
                  <path
                    d="M21 12a9 9 0 1 0-1.7 5.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M21 3v6h-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>

              <div className="filters-scroll" role="toolbar" aria-label="Filters">
                {/* Customer Region */}
                <div className="filter-pill" ref={regionRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRegionOpen((s) => !s);
                    }}
                  >
                    Customer Region <span className="chev">▾</span>
                  </button>
                  {regionOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setRegions([]);
                          setPage(1);
                          setRegionOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("North", setRegions);
                          setRegionOpen(false);
                        }}
                        className="pop-item"
                      >
                        North
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("South", setRegions);
                          setRegionOpen(false);
                        }}
                        className="pop-item"
                      >
                        South
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("East", setRegions);
                          setRegionOpen(false);
                        }}
                        className="pop-item"
                      >
                        East
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("West", setRegions);
                          setRegionOpen(false);
                        }}
                        className="pop-item"
                      >
                        West
                      </button>
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="filter-pill" ref={genderRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGenderOpen((s) => !s);
                    }}
                  >
                    Gender <span className="chev">▾</span>
                  </button>
                  {genderOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setGenders([]);
                          setPage(1);
                          setGenderOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("Male", setGenders);
                          setGenderOpen(false);
                        }}
                        className="pop-item"
                      >
                        Male
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("Female", setGenders);
                          setGenderOpen(false);
                        }}
                        className="pop-item"
                      >
                        Female
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("Other", setGenders);
                          setGenderOpen(false);
                        }}
                        className="pop-item"
                      >
                        Other
                      </button>
                    </div>
                  )}
                </div>

                {/* Age Range */}
                <div className="filter-pill" ref={ageRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAgeOpen((s) => !s);
                    }}
                  >
                    Age Range <span className="chev">▾</span>
                  </button>
                  {ageOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setAgeRange("");
                          setPage(1);
                          setAgeOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setAgeRange("18-25");
                          setPage(1);
                          setAgeOpen(false);
                        }}
                        className="pop-item"
                      >
                        18–25
                      </button>
                      <button
                        onClick={() => {
                          setAgeRange("26-35");
                          setPage(1);
                          setAgeOpen(false);
                        }}
                        className="pop-item"
                      >
                        26–35
                      </button>
                      <button
                        onClick={() => {
                          setAgeRange("36-50");
                          setPage(1);
                          setAgeOpen(false);
                        }}
                        className="pop-item"
                      >
                        36–50
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Category */}
                <div className="filter-pill" ref={categoryRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryOpen((s) => !s);
                    }}
                  >
                    Product Category <span className="chev">▾</span>
                  </button>
                  {categoryOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setCategoryText("");
                          setPage(1);
                          setCategoryOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setCategoryText("Clothing");
                          setPage(1);
                          setCategoryOpen(false);
                        }}
                        className="pop-item"
                      >
                        Clothing
                      </button>
                      <button
                        onClick={() => {
                          setCategoryText("Electronics");
                          setPage(1);
                          setCategoryOpen(false);
                        }}
                        className="pop-item"
                      >
                        Electronics
                      </button>
                      <button
                        onClick={() => {
                          setCategoryText("Home");
                          setPage(1);
                          setCategoryOpen(false);
                        }}
                        className="pop-item"
                      >
                        Home
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="filter-pill" ref={tagsRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTagsOpen((s) => !s);
                    }}
                  >
                    Tags <span className="chev">▾</span>
                  </button>
                  {tagsOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setTags([]);
                          setPage(1);
                          setTagsOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setTags(["new"]);
                          setTagsOpen(false);
                          setPage(1);
                        }}
                        className="pop-item"
                      >
                        new
                      </button>
                      <button
                        onClick={() => {
                          setTags(["promo"]);
                          setTagsOpen(false);
                          setPage(1);
                        }}
                        className="pop-item"
                      >
                        promo
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="filter-pill" ref={paymentRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentOpen((s) => !s);
                    }}
                  >
                    Payment Method <span className="chev">▾</span>
                  </button>
                  {paymentOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setPaymentMethods([]);
                          setPage(1);
                          setPaymentOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("Card", setPaymentMethods);
                          setPaymentOpen(false);
                        }}
                        className="pop-item"
                      >
                        Card
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("Cash", setPaymentMethods);
                          setPaymentOpen(false);
                        }}
                        className="pop-item"
                      >
                        Cash
                      </button>
                      <button
                        onClick={() => {
                          handleSingleSelect("UPI", setPaymentMethods);
                          setPaymentOpen(false);
                        }}
                        className="pop-item"
                      >
                        UPI
                      </button>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="filter-pill" ref={dateRef}>
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateOpen((s) => !s);
                    }}
                  >
                    Date <span className="chev">▾</span>
                  </button>
                  {dateOpen && (
                    <div className="simple-pop">
                      <button
                        onClick={() => {
                          setDateRange("");
                          setPage(1);
                          setDateOpen(false);
                        }}
                        className="pop-item"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setDateRange("last30");
                          setPage(1);
                          setDateOpen(false);
                        }}
                        className="pop-item"
                      >
                        Last 30 days
                      </button>
                      <button
                        onClick={() => {
                          setDateRange("thisMonth");
                          setPage(1);
                          setDateOpen(false);
                        }}
                        className="pop-item"
                      >
                        This month
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="controls-right">
              <input
                className="search-pill"
                type="text"
                placeholder="Name, Phone no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <select
                className="sort-pill"
                value={sortValue}
                onChange={(e) => updateSortFromValue(e.target.value)}
              >
                <option value="customerName_asc">
                  Sort by: Customer Name (A–Z)
                </option>
                <option value="customerName_desc">
                  Sort by: Customer Name (Z–A)
                </option>
                <option value="date_desc">Sort by: Date (Newest)</option>
                <option value="date_asc">Sort by: Date (Oldest)</option>
                <option value="productCategory_asc">
                  Sort by: Product Category (A–Z)
                </option>
                <option value="productCategory_desc">
                  Sort by: Product Category (Z–A)
                </option>
              </select>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-label">Total units sold</div>
                <div className="kpi-info">i</div>
              </div>
              <div className="kpi-value">{totalUnitsPage}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-label">Total Amount</div>
                <div className="kpi-info">i</div>
              </div>
              <div className="kpi-value">
                ₹ {Number(totalAmountPage || 0).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-label">Total Discount</div>
                <div className="kpi-info">i</div>
              </div>
              <div className="kpi-value">₹ 0</div>
            </div>
          </div>

          {/* Table */}
          <main className="content-area">
            <section className="table-shell">
              <div className="table-header-row">
                <h2>Transactions</h2>
                <p className="table-meta">
                  {loading
                    ? "Loading..."
                    : `Page ${meta.currentPage || 1} of ${
                        meta.totalPages || 1
                      } • ${meta.totalItems || 0} records`}
                </p>
              </div>

              {error && <div className="error-banner">{error}</div>}

              <div className="table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer ID</th>
                      <th>Customer name</th>
                      <th>Phone Number</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Product Category</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Customer region</th>
                      <th>Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="11">Loading...</td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="11">No records found.</td>
                      </tr>
                    ) : (
                      transactions.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row["Date"] || row.date || ""}</td>
                          <td>{row["Customer ID"] || row.customerId || ""}</td>
                          <td>
                            {row["Customer Name"] || row.customerName || ""}
                          </td>
                          <td>{row["Phone Number"] || row.phoneNumber || ""}</td>
                          <td>{row["Gender"] || row.gender || ""}</td>
                          <td>{row["Age"] || row.age || ""}</td>
                          <td>
                            {row["Product Category"] ||
                              row.productCategory ||
                              ""}
                          </td>
                          <td>{row["Quantity"] || row.quantity || ""}</td>
                          <td>
                            {row["Final Amount"] || row.finalAmount || ""}
                          </td>
                          <td>
                            {row["Customer Region"] ||
                              row.customerRegion ||
                              ""}
                          </td>
                          <td>
                            {row["Payment Method"] ||
                              row.paymentMethod ||
                              ""}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-row">
                {buildPageNumbers().map((p) => (
                  <button
                    key={p}
                    className={
                      "page-number" +
                      (p === (meta.currentPage || page) ? " active" : "")
                    }
                    onClick={() => handlePageClick(p)}
                    disabled={loading}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
