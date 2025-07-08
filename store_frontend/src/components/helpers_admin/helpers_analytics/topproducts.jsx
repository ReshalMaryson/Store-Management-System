import React, { useState, useEffect } from "react";
import "../../../css/helpers/helper_analytics/topproducts.css";
import goback from "../../../assets/images/arrow.png";
import refreshicon from "../../../assets/images/refreshicon.png";

//charts
import { Bar } from "react-chartjs-2";

export default function TopProduts({
  showAnalyticsblock,
  closeTopProductsblock,
}) {
  const [TopproductData, setTopProduct] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    getTopProducts();
  }, []);

  function getTopProducts() {
    if (token === "" || token === null) {
      setActivites([]);
      return;
    }

    fetch("http://127.0.0.1:8000/api/billitems/analytics/topproducts", {
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
          // console.log(res.data);
          setTopProduct(res.data);
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        return;
      });
  }

  // Prepare data for Chart
  const labels = TopproductData.map((item) => item.name);
  const values = TopproductData.map((item) => item.total_sold);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Total Sold",
        data: values,
        backgroundColor: "#000086",
        borderRadius: 5,
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
            closeTopProductsblock(false);
            showAnalyticsblock(false);
          }}
          title="Back"
          aria-label="Back"
        />
      </div>
      <div className="wrap_chart_block">
        <div className="titleandrefresh">
          <h1>Top Products</h1>
          <img
            src={refreshicon}
            alt="refresh"
            onClick={getTopProducts}
            title="Refresh Data"
            aria-label="Refresh Data"
          />
        </div>
        <div className="topproductschart_block">
          {TopproductData.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
        <p>❔ Top 5 Frequently Sold Products Over the Time. </p>
      </div>
    </>
  );
}
