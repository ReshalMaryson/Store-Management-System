import React, { useState, useEffect } from "react";
import "../../../css/helpers/helper_analytics/topproducts.css";
import goback from "../../../assets/images/arrow.png";
import refreshicon from "../../../assets/images/refreshicon.png";

//charts
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";

export default function TopCashier({
  showAnalyticsblock,
  closeTopCashiersblock,
}) {
  const [TopCashiers, setTopCashiers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    getTopCashiers();
  }, []);

  function getTopCashiers() {
    if (token === "" || token === null) {
      setActivites([]);
      return;
    }

    fetch("http://127.0.0.1:8000/api/bill/analytics/topcashiers", {
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
          setTopCashiers(res.data);
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        return;
      });
  }

  // Prepare data for Chart

  const maxCashiers = 5;
  let paddedData = [...TopCashiers];

  if (paddedData.length < maxCashiers) {
    const fillers = maxCashiers - paddedData.length;
    for (let i = 0; i < fillers; i++) {
      paddedData.push({
        staff: { name: "" },
        total_bills: 0,
      });
    }
  }

  const labels = paddedData.map((item) => item.staff.name || "");
  const values = paddedData.map((item) => item.total_bills);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Total Bills",
        data: values,
        backgroundColor: values.map((val) =>
          val === 0 ? "rgba(0,0,0,0.05)" : "#000086"
        ),
        borderRadius: 5,
        categoryPercentage: 0.6,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#000",
        },
        grid: {
          display: false,
        },

        min: 0,
        max: 4,
      },
      y: {
        ticks: {
          color: "#000",
          stepSize: 1, // Optional: better readability
        },
      },
    },
  };

  return (
    <>
      <div id="goback">
        <img
          src={goback}
          alt="close"
          onClick={() => {
            closeTopCashiersblock(false);
            showAnalyticsblock(false);
          }}
          title="Back"
          aria-label="Back"
        />
      </div>
      <div className="wrap_chart_block">
        <div className="titleandrefresh">
          <h1>Top Cashiers</h1>
          <img
            src={refreshicon}
            alt="refresh"
            onClick={getTopCashiers}
            title="Refresh Data"
            aria-label="Refresh Data"
          />
        </div>
        <div className="topproductschart_block">
          {TopCashiers.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
        <p>❔ Top 5 Cashiers by Sales Over the Time. </p>
      </div>
    </>
  );
}
