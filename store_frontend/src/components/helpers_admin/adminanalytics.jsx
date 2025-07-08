import React, { useState } from "react";
import "../../css/helpers/analytics.css";

import ActivityLog from "./helpers_analytics/activitylog";
import TopProduts from "./helpers_analytics/topproducts";
import TopCashier from "./helpers_analytics/topcashier";
import TopSales from "./helpers_analytics/topsales";
import StorePerformance from "./helpers_analytics/storeperformance";

export default function Analytics() {
  //DOM
  const [show_activtylog, setShowActivityLog] = useState(false);
  const [show_topproducts, setShowTopProducts] = useState(false);
  const [show_topsales, setShowTopSales] = useState(false);
  const [show_topcashiers, setShowTopCashiers] = useState(false);
  const [show_storeperformance, setShowStorePerformance] = useState(false);
  const [show_analytics, setShowAnalytics] = useState(false);

  //  Methods to switch analytics components

  function ShowActivityLog() {
    setShowActivityLog((prv) => !prv);
    setShowAnalytics(true);
    setShowTopProducts(false);
    setShowTopSales(false);
    setShowTopCashiers(false);
    setShowStorePerformance(false);
  }

  function ShowTopProducts() {
    setShowTopProducts((prv) => !prv);
    setShowAnalytics(true);
    setShowActivityLog(false);
    setShowTopSales(false);
    setShowTopCashiers(false);
    setShowStorePerformance(false);
  }

  function ShowTopSales() {
    setShowTopSales((prv) => !prv);
    setShowAnalytics(true);
    setShowActivityLog(false);
    setShowTopCashiers(false);
    setShowTopProducts(false);
    setShowStorePerformance(false);
  }

  function ShowTopCashiers() {
    setShowTopCashiers((prv) => !prv);
    setShowAnalytics(true);
    setShowActivityLog(false);
    setShowTopSales(false);
    setShowTopProducts(false);
    setShowStorePerformance(false);
  }

  function ShowStorePerformance() {
    setShowStorePerformance((prv) => !prv);
    setShowAnalytics(true);
    setShowActivityLog(false);
    setShowTopSales(false);
    setShowTopProducts(false);
    setShowTopCashiers(false);
  }

  return (
    <>
      <div id="analytics_container" className={show_analytics ? "hide" : ""}>
        <div className="card" id="card_activity_log" onClick={ShowActivityLog}>
          <p>Activity Log</p>
        </div>

        <div className="card" id="card_topproducts" onClick={ShowTopProducts}>
          <p>Top Performing Products</p>
        </div>

        <div className="card" id="card_topcashier" onClick={ShowTopCashiers}>
          <p>Top Performing Cashiers</p>
        </div>

        <div className="card" id="card_topsale" onClick={ShowTopSales}>
          <p>Top Sales</p>
        </div>

        <div
          className="card"
          id="card_storeperformance"
          onClick={ShowStorePerformance}
        >
          <p>Store Performance</p>
        </div>
      </div>

      <div id="show_analytics_components">
        <div id="activitylog" className={show_activtylog ? "active" : ""}>
          <ActivityLog
            showAnalyticsblock={setShowAnalytics}
            closeActivityblock={setShowActivityLog}
          />
        </div>

        <div id="topproducts" className={show_topproducts ? "active" : ""}>
          <TopProduts
            showAnalyticsblock={setShowAnalytics}
            closeTopProductsblock={setShowTopProducts}
          />
        </div>

        <div id="topcashier" className={show_topcashiers ? "active" : ""}>
          <TopCashier
            showAnalyticsblock={setShowAnalytics}
            closeTopCashiersblock={setShowTopCashiers}
          />
        </div>

        <div id="topsales" className={show_topsales ? "active" : ""}>
          <TopSales
            showAnalyticsblock={setShowAnalytics}
            closeTopSalesblock={setShowTopSales}
          />
        </div>

        <div
          id="storeperformance"
          className={show_storeperformance ? "active" : ""}
        >
          <StorePerformance
            showAnalyticsblock={setShowAnalytics}
            closeStorePerformanceblock={setShowStorePerformance}
          />
        </div>
      </div>
    </>
  );
}
