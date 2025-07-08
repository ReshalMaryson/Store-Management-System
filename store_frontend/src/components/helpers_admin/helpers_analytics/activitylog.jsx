import React, { useState, useEffect } from "react";
import "../../../css/helpers/helper_analytics/activity_log.css";
import goback from "../../../assets/images/arrow.png";
import filter from "../../../assets/images/filtericon.png";
import refreshicon from "../../../assets/images/refreshicon.png";

export default function ActivityLog({
  showAnalyticsblock,
  closeActivityblock,
}) {
  const token = localStorage.getItem("token");

  // search activity
  const [Filter, setFilter] = useState("");
  const [Action_type, setAction_Type] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [customFrom, setCustomFrom] = useState("");

  // pagination setup
  const [Activities, setActivites] = useState([]); // respose data
  const [displayPageNumbers, setDisplayPageNumbers] = useState([]); // page numbers array
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    getActivityLogs();
  }, [Filter, currentPage, Action_type]);

  // handle filter manually to stop request loop.
  function handleFilter(newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
    return;
  }

  function refreshlogs() {
    setFilter("");
    setCurrentPage(1);
    return;
  }

  // get all activities
  function getActivityLogs() {
    if (token === "" || token === null) {
      setActivites([]);
      return;
    }

    var data = null;

    if (Filter === "custom" && customTo !== "" && customFrom !== "") {
      data = {
        filter: Filter,
        action_type: Action_type,
        to: customTo,
        from: customFrom,
        pagenum: currentPage,
      };
    } else {
      data = {
        filter: Filter !== "" ? Filter : "today",
        action_type: Action_type,
        pagenum: currentPage,
      };
    }

    fetch(`http://127.0.0.1:8000/api/analytics/activities`, {
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
        if (res.status === "success") {
          setActivites(res.data.activities);
          // setting number of page btns to display
          setDisplayPageNumbers(
            Array.from({ length: res.data.last_page }, (_, i) => i + 1)
          );
          setLastPage(res.data.last_page);
          return;
        } else if (res.status === "notfound") {
          setActivites([]);
          return;
        }
      })
      .catch((err) => {
        return;
      });
  }

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
  return (
    <>
      <div className="activities_container">
        <div id="goback">
          <img
            src={goback}
            alt="close"
            onClick={() => {
              closeActivityblock(false);
              showAnalyticsblock(false);
              setFilter("");
              setAction_Type("");
              setDisplayPageNumbers([]);
              setCurrentPage(1);
              setLastPage(1);
              setActivites([]);
              setCustomFrom("");
              setCustomTo("");
            }}
            title="Back"
            aria-label="Back"
          />
        </div>

        {/* search block */}
        <div className="search_activities">
          {/* search by fix filter */}
          <div
            className={`searchbyfilter ${Filter === "custom" ? "hide" : ""}`}
          >
            <img src={filter} alt="" />
            <select
              name=""
              id=""
              value={Filter}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* search by date range */}
          <div
            className={`searchbycustomdate ${
              Filter === "custom" ? "active" : ""
            }`}
          >
            <div className="dateEntry">
              <div className="entrywrap">
                <label htmlFor="">From : </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="entrywrap">
                <label htmlFor="">To : </label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </div>
            <div className="wrap_customdate_btns">
              <button
                onClick={() => getActivityLogs()}
                className="searchcustombtn"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setFilter("today");
                  setCustomFrom("");
                  setCustomTo("");
                }}
                className="clearcustomsearch"
              >
                Clear
              </button>
            </div>
          </div>

          {/* search by action type */}
          <div className="filterbyactiontype">
            <label htmlFor="">Action Type : </label>
            <select
              name=""
              id=""
              value={Action_type}
              onChange={(e) => setAction_Type(e.target.value)}
            >
              <option value="">None</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
              <option value="Deleted">Deleted</option>
              <option value="Logged In">Logged In</option>
              <option value="Logged Out">Logged Out</option>
              <option value="Searched">Searched</option>
            </select>
          </div>
        </div>

        <div className="refreshlogs">
          <p>Activities ({Activities.length})</p>
          <img
            src={refreshicon}
            alt=""
            onClick={() => {
              refreshlogs();
              setFilter("");
              setAction_Type("");
            }}
            title="Refresh Data"
            aria-label="Refersh Data"
          />
        </div>

        {/* show all activities */}
        <div id="show_activity">
          <ul id="activity_items_title">
            <li>UserId</li>
            <li>Action</li>
            <li>Role</li>
            <li>Description</li>
            <li>Related To</li>
            <li>Related ID</li>
            <li>Time</li>
          </ul>
          <div id="activity_wrapper">
            {Activities.length > 0 ? (
              Activities.map((item) => {
                return (
                  <div id="activity" key={item.id}>
                    <p id="p_name">{item.user_id}</p>
                    <p id="p_barcode">{item.action_type}</p>
                    <p>{item.role}</p>
                    <p id="p_supplier"> {item.description}</p>
                    <p id="p_stock"> {item.related_type}</p>
                    <p id="p_purchase"> {item.related_id}</p>
                    <p id="p_selling"> {formatTime(item.created_at)}</p>
                  </div>
                );
              })
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "1rem",
                  marginTop: "50px",
                }}
              >
                No Activity Found!
              </p>
            )}
          </div>
        </div>

        {/* pagination controls */}
        {Activities.length > 0 ? (
          <div
            id="pagination_control"
            style={{
              display: "flex",
              gap: "5px",
              paddingBottom: "1.5rem",
              marginTop: "10px",
            }}
          >
            {/* PREV BUTTON */}
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                background: "#f0f0f0",
                color: "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              « Prev
            </button>

            {/* PAGE NUMBER BUTTONS */}
            <div style={{ display: "flex", gap: "10px" }}>
              {displayPageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    background: pageNum === currentPage ? "#000086" : "#f0f0f0",
                    color: pageNum === currentPage ? "#fff" : "#000",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* NEXT BUTTON */}
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === lastPage}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                background: "#f0f0f0",
                color: "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              Next »
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
