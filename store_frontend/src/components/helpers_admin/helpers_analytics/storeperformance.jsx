import React, { useState, useEffect } from "react";
import filtericon from "../../../assets/images/filtericon.png";
import goback from "../../../assets/images/arrow.png";
import refreshicon from "../../../assets/images/refreshicon.png";
import "../../../css/helpers/helper_analytics/storeperformance.css";

//charts
import { Bar } from "react-chartjs-2";

export default function StorePerformance({
  showAnalyticsblock,
  closeStorePerformanceblock,
}) {
  const [StorePerformance, setStorePerformance] = useState(null);
  const token = localStorage.getItem("token");

  // filters
  const [Filter, setFilter] = useState("week");
  const [CustomTo, setCustomTo] = useState("");
  const [CustomFrom, setCustomFrom] = useState("");

  useEffect(() => {
    if (Filter === "custom") {
      return;
    } else {
      getStorePerformance();
    }
  }, [Filter]);

  function getStorePerformance() {
    if (token === "" || token === null) {
      setStorePerformance(null);
      return;
    }
    var data = null;

    if (Filter === "custom" && CustomTo !== "" && CustomFrom !== "") {
      data = {
        filter: Filter,
        to: CustomTo,
        from: CustomFrom,
      };
    } else {
      data = {
        filter: Filter,
      };
    }

    fetch("http://127.0.0.1:8000/api/bill/analytics/storeperformance", {
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
          setStorePerformance(res.data);
        } else if (res.status === "failure") {
          setStorePerformance(null);
        }
      })
      .catch((error) => {
        return;
      });
  }

  // prepare chart data
  let chartData;
  let chartOptions;
  if (StorePerformance) {
    const labels = ["Total Revenue", "Total Bills", "Average Sale"];
    const values = [
      parseFloat(StorePerformance.total_revenue),
      parseInt(StorePerformance.total_bills),
      parseFloat(StorePerformance.average_sale),
    ];

    chartData = {
      labels: labels,
      datasets: [
        {
          label: "Store Performance",
          data: values,
          backgroundColor: ["#007BFF", "#28A745", "#FFC107"],
          borderRadius: 5,
          categoryPercentage: 0.6,
          barPercentage: 0.6,
        },
      ],
    };

    chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label;
              const value = context.raw;
              if (label === "Total Revenue" || label === "Average Sale") {
                return `${label}: Rs ${value.toFixed(2)}`;
              }
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#000",
            font: {
              weight: "bold",
            },
          },
        },
        y: {
          type: "logarithmic",
          ticks: {
            color: "#000",
            font: {
              weight: "bold",
            },
          },
        },
      },
    };
  }

  return (
    <>
      <div id="goback">
        <img
          src={goback}
          alt="close"
          onClick={() => {
            closeStorePerformanceblock(false);
            showAnalyticsblock(false);
          }}
          title="Back"
          aria-label="Back"
        />
      </div>
      <div className="filters">
        {/* fixed filters */}

        <div className="fixedfilters">
          <img src={filtericon} alt="" />
          <select
            name=""
            id=""
            value={Filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="month">select</option>
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="6months">6 Months</option>
            <option value="year">Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* custom date fliter */}
        {Filter === "custom" ? (
          <div className="customdatefilter">
            <div className="custom_entry">
              <label htmlFor="">From </label>
              <input
                type="date"
                value={CustomFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>

            <div className="custom_entry">
              <label htmlFor="">To </label>
              <input
                type="date"
                value={CustomTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>

            <button onClick={getStorePerformance}>Filter</button>
          </div>
        ) : null}
      </div>

      {/* show Performance chart  */}
      {StorePerformance ? (
        <div className="wrap_chart_block">
          <div className="titleandrefresh_performance">
            <h1>Store Overall Performance</h1>
            <img
              src={refreshicon}
              alt="refresh"
              onClick={() => setFilter("week")}
              title="Refresh Data"
              aria-label="Refresh Data"
            />
          </div>
          <div className="topproductschart_block">
            {StorePerformance ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
          <p>❔ Store Performance over {Filter}. </p>
        </div>
      ) : (
        <p style={{ fontSize: "1rem", textAlign: "center", marginTop: "30px" }}>
          {" "}
          Data Not Found For Filter {Filter}
        </p>
      )}
    </>
  );
}
