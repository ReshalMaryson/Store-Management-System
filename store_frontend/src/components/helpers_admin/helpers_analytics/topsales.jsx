import React, { useState, useEffect } from "react";
import "../../../css/helpers/helper_analytics/topproducts.css";
import goback from "../../../assets/images/arrow.png";
import refreshicon from "../../../assets/images/refreshicon.png";

//charts
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";

export default function TopSales({ showAnalyticsblock, closeTopSalesblock }) {
  const [TopSales, setTopSales] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    getTopSales();
  }, []);

  function getTopSales() {
    if (token === "" || token === null) {
      setTopSales([]);
      return;
    }

    fetch("http://127.0.0.1:8000/api/bill/analytics/topsales", {
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
          setTopSales(res.data);
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        return;
      });
  }

  // Prepare data for Chart
  const labels = TopSales.map((item) => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `Sale #${item.id} (${formattedDate})`;
  });

  const values = TopSales.map((item) => item.total);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Total Bill (Rs)",
        data: values,
        backgroundColor: "#000086",
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
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
      },
      y: {
        ticks: {
          color: "#000",
          stepSize: 100,
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
            closeTopSalesblock(false);
            showAnalyticsblock(false);
          }}
          title="Back"
          aria-label="Back"
        />
      </div>
      <div className="wrap_chart_block">
        <div className="titleandrefresh">
          <h1>Top Sales</h1>
          <img
            src={refreshicon}
            alt="refresh"
            onClick={getTopSales}
            title="Refresh Data"
            aria-label="Refresh Data"
          />
        </div>
        <div className="topproductschart_block">
          {TopSales.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
        <p>❔ Top 3 Highest Sales Over the Time. </p>
      </div>
    </>
  );
}
