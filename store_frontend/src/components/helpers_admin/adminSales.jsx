import React, { useState, useEffect, useRef } from "react";
import "../../css/helpers/sales.css";
import filtericon from "../../assets/images/filtericon.png";
import searchicon from "../../assets/images/search icon white.png";
import refreshicon from "../../assets/images/refreshicon.png";

export default function Sales() {
  const [searchBillquery, setSearchBillQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [billSearched, setBillSearched] = useState(false); // true for every search reuqest
  const [showBillItems, setShowBillItems] = useState(false); // to show items of bill on ui

  const [Errorquery, setErrorQuery] = useState("");
  const [Errorfilter, setErrorFilter] = useState("");

  const token = localStorage.getItem("token");

  // pagination setup
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, links: [] });
  const [totalSales, setTotalSales] = useState("");

  // get bills
  useEffect(() => {
    getSales(pagination.current_page);
  }, [pagination.current_page]);

  //get all sales
  function getSales(pageNum = 1) {
    fetch(`http://127.0.0.1:8000/api/bills?page=${pageNum}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        return resp.json();
      })
      .then((res) => {
        if (res.status === "success") {
          setBills(res.data.data);
          setTotalSales(res.data.total);
          setPagination({
            current_page: res.data.current_page,
            links: res.data.links,
          });
        }
      });
  }

  // pagination controllers
  const handlePageClick = (url) => {
    if (!url) return;
    const page = new URL(url).searchParams.get("page");
    setPagination((prev) => ({ ...prev, current_page: Number(page) }));
  };

  //  format time.
  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  // search bill  for button query
  function searchBill() {
    var query = {};
    if (searchFilter === "" && customDate === "") {
      query = {
        type: "IdOrTotal",
        query: searchBillquery,
      };

      fetch("http://127.0.0.1:8000/api/bills/admin/search", {
        method: "POST",
        body: JSON.stringify(query),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((resp) => {
          return resp.json();
        })
        .then((res) => {
          setBillSearched(true);
          if (res.status === "success") {
            setBills(res.data);
            setCustomDate("");
            setErrorQuery("");
          } else if (res.status === "notfound") {
            setErrorQuery(res.message);
            setBillSearched(false);
          }
        })
        .catch((error) => {
          setError(error);
        });
    }
  }

  // search Bill for fixed filters
  useEffect(() => {
    var data = {};

    if ((searchFilter === "" || searchFilter === "none") && customDate === "") {
      return;
    }

    if (searchFilter === "custom") {
      data = {
        type: "custom",
        query: customDate,
      };
    } else if (searchFilter !== "custom" && searchBillquery === "") {
      data = {
        type: "filter",
        query: searchFilter,
      };
    }

    fetch("http://127.0.0.1:8000/api/bills/admin/search", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        return resp.json();
      })
      .then((res) => {
        setBillSearched(true);
        if (res.status === "success") {
          setBills(res.data);
          setSearchBillQuery("");
          setCustomDate("");
          setErrorFilter("");
          return;
        } else if (res.status === "notfound") {
          setErrorFilter(res.message);
          return;
        }
      })
      .catch((error) => {
        setError(error);
      });
  }, [searchFilter, customDate]);

  // error display
  useEffect(() => {
    if (Errorquery) {
      const timer = setTimeout(() => {
        setErrorQuery("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Errorquery]);

  // clear search
  function clearBill() {
    bills ? setBills([]) : null;
    getSales(pagination.current_page);
    setBillSearched(false);
    setSearchBillQuery("");
    setCustomDate("");
    setSearchFilter("");
    setErrorQuery("");
    setErrorFilter("");
  }

  // open bill for details
  function open_details(orderId) {
    setShowBillItems((prev) => (prev === orderId ? null : orderId));
  }

  return (
    <>
      <div id="search_Bill_cont">
        <p id="numberofsales">Sales ({bills.length})</p>

        <div id="search_sale">
          {/* custom and filter search */}
          <div id="filter_custom_search_sale">
            <img src={filtericon} alt="" />
            <select
              name=""
              id="select_filter"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCustomDate("");
                setSearchBillQuery("");
              }}
            >
              <option value="none">Select Filter</option>
              <option value="today">Today</option>
              <option value="3days">3 Days</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="3months">3 Months</option>
              <option value="year">year</option>
              <option value="custom">Custom Date</option>
            </select>

            <br />

            {searchFilter === "custom" ? (
              <div>
                <input
                  type="date"
                  id="input_search_bill_date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setSearchBillQuery("");
                  }}
                />
              </div>
            ) : null}
            <br />
            <p style={{ color: "red", fontSize: "0.7rem", width: "50%" }}>
              {Errorfilter}
            </p>
          </div>
          {/* search bar */}
          <div id="sales_search_bar">
            <input
              type="search"
              id="input_search_bill"
              placeholder="id,total"
              value={searchBillquery}
              onChange={(e) => {
                setSearchBillQuery(e.target.value);
                setSearchFilter("");
                setCustomDate("");
              }}
            />
            <div id="sales_search_icon" onClick={searchBill}>
              <img src={searchicon} alt="" />
            </div>
            <p style={{ color: "red", fontSize: "0.7rem" }}>{Errorquery}</p>
            <br />
          </div>
        </div>

        <div id="clear_search" className={billSearched ? "active" : ""}>
          <p onClick={clearBill} id="p_clear_search">
            Clear Search
          </p>
        </div>

        <div className="refreshsales">
          <img
            src={refreshicon}
            alt=""
            onClick={() => {
              getSales(1);
              setBillSearched(false);
              setSearchBillQuery("");
              setSearchFilter("");
            }}
            title="Refresh Data"
            aria-label="Refresh Data"
          />
        </div>

        {/* show all sales */}
        <div id="show_sales">
          <ul id="sales_items_title">
            <li id="title_name">Bill ID</li>
            <li id="title_barcode"> Staff ID</li>
            <li>SubTotal</li>
            <li>Discount</li>
            <li>Total</li>
            <li>Date</li>
          </ul>

          <div id="sales_wrapper">
            {bills.length > 0 ? (
              bills.map((bill) => {
                return (
                  <div
                    // id="sale"
                    key={bill.id}
                    onClick={() => open_details(bill.id)}
                    className={`sale ${
                      showBillItems === bill.id ? "active" : ""
                    } `}
                  >
                    <p>{bill.id} </p>
                    <p>{bill.staff_id}</p>
                    <p>{bill.subtotal}</p>
                    <p>{bill.discount}%</p>
                    <p>{bill.total}</p>
                    <p>{formatTime(bill.created_at)}</p>

                    {/* show items */}
                    <div id="sale_items">
                      <h3 id="sale_item_heading">Items</h3>
                      <div id="sale_items_title">
                        <p>Name</p>
                        <p>Qty</p>
                        <p>Price</p>
                      </div>
                      {bill.bill_items.map((item) => {
                        return (
                          <div key={item.id} id="item">
                            <p> {item.name}</p>
                            <p>{item.quantity}</p>
                            <p> {item.price_per_unit}</p>
                            <br />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: "center" }}>Loading...</p>
            )}
          </div>
        </div>

        {/* pagination controls */}
        <div id="pagination_control">
          {pagination.links.map((link, index) => (
            <button
              id="pagination_control_btn"
              key={index}
              onClick={() => handlePageClick(link.url)}
              disabled={!link.url}
              style={{
                background: link.active ? "#000086" : "#f0f0f0",
                color: link.active ? "#fff" : "#000",
                border: "none",
                padding: "6px 10px",
                borderRadius: "4px",
              }}
              dangerouslySetInnerHTML={{
                __html: link.label
                  .replace("&laquo;", "«")
                  .replace("&raquo;", "»"),
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
