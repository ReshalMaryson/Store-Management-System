import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";

import "../css/dashboard.css";
import CreateUserForm from "./helpers_admin/createuserform";
import AddProductform from "./helpers_admin/createproductform";
import AdminAllProducts from "./helpers_admin/adminallproducts";
import AdminAllUsers from "./helpers_admin/adminallusers";
import Sales from "./helpers_admin/adminSales";
import Analytics from "./helpers_admin/adminanalytics";

export default function Dashboard() {
  const navigate = useNavigate();

  // DOM Variables
  const [show_createuser_form, setShowUserForm] = useState(false);
  const [show_createproduct_form, setShowProductForm] = useState(false);
  const [show_allprods, setShowAllProds] = useState(false);
  const [show_allusers, setShowAllUsers] = useState(false);
  const [show_allsales, setShowAllSales] = useState(false);
  const [show_analytics, setShowAnalytics] = useState(false);
  const [refreshproducts, setRefreshProducts] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/test-auth", {
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
        if (res.status === "authenticated") {
          if (res.user.role !== "admin") {
            navigate("/");
          }
        }
      })
      .catch((error) => {
        return;
      });
  }, []);

  // reqests.
  function logoutAdmin() {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/user/logout", {
      method: "POST",
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
          localStorage.removeItem("token");
          navigate("/");
        } else if (res.status === "faliure") {
          alert("Error Logging Out");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // DOM Methods
  function showCreateuserForm() {
    setShowUserForm((prev) => !prev);
    setShowProductForm(false);
    setShowAllProds(false);
    setShowAllUsers(false);
    setShowAllSales(false);
    setShowAnalytics(false);
  }

  function showProductForm() {
    setShowProductForm((prev) => !prev);
    setShowUserForm(false);
    setShowAllProds(false);
    setShowAllUsers(false);
    setShowAllSales(false);
    setShowAnalytics(false);
  }

  function showAllProds() {
    setShowAllProds((prev) => !prev);
    setShowUserForm(false);
    setShowProductForm(false);
    setShowAllUsers(false);
    setShowAllSales(false);
    setShowAnalytics(false);
  }

  function showAllUsers() {
    setShowAllUsers((prev) => !prev);
    setShowUserForm(false);
    setShowProductForm(false);
    setShowAllProds(false);
    setShowAllSales(false);
    setShowAnalytics(false);
  }

  function showAllSales() {
    setShowAllSales((prev) => !prev);
    setShowAllUsers(false);
    setShowUserForm(false);
    setShowProductForm(false);
    setShowAllProds(false);
    setShowAnalytics(false);
  }

  function showAnalytics() {
    setShowAnalytics((prev) => !prev);
    setShowAllSales(false);
    setShowAllUsers(false);
    setShowUserForm(false);
    setShowProductForm(false);
    setShowAllProds(false);
  }
  return (
    <>
      <div id="dashboard_container">
        <Navbar />
        <div id="dashboard_head">
          <button id="dashboard_btn_loguot" onClick={logoutAdmin}>
            Admin Logout
          </button>
        </div>

        {/* components controls */}
        <div id="component_controls">
          <button
            type="button"
            id="compo_adduser__btn"
            className={show_createuser_form ? "active" : ""}
            onClick={showCreateuserForm}
          >
            Add User
          </button>

          <button
            type="button"
            onClick={showProductForm}
            id="compo_addproduct__btn"
            className={show_createproduct_form ? "active" : ""}
          >
            Add Product
          </button>

          <button
            type="button"
            onClick={showAllProds}
            id="compo_allproducts_btn"
            className={show_allprods ? "active" : ""}
          >
            All Products
          </button>

          <button
            type="button"
            onClick={showAllUsers}
            id="compo_allusers_btn"
            className={show_allusers ? "active" : ""}
          >
            All Users
          </button>

          <button
            type="button"
            onClick={showAllSales}
            id="compo_allsales_btn"
            className={show_allsales ? "active" : ""}
          >
            Sales
          </button>

          <button
            type="button"
            onClick={showAnalytics}
            id="compo_analytics_btn"
            className={show_analytics ? "active" : ""}
          >
            Analytics
          </button>
        </div>

        {/* dashboard Sections */}
        <div id="dashboard_components">
          <div
            id="div_createuser_form"
            className={show_createuser_form ? "active" : ""}
          >
            <CreateUserForm />
          </div>

          <div
            id="div_addproduct_form"
            className={show_createproduct_form ? "active" : ""}
          >
            <AddProductform setProductrefresh={setRefreshProducts} />
          </div>

          <div id="div_showallprods" className={show_allprods ? "active" : ""}>
            <AdminAllProducts
              refreshproducts={refreshproducts}
              setProductrefresh={setRefreshProducts}
            />
          </div>

          <div id="div_showallusers" className={show_allusers ? "active" : ""}>
            <AdminAllUsers />
          </div>

          <div id="div_showallsales" className={show_allsales ? "active" : ""}>
            <Sales />
          </div>

          <div
            id="div_showanalytics"
            className={show_analytics ? "active" : ""}
          >
            <Analytics />
          </div>
        </div>
      </div>

      <div className="screensize_caution2">
        <p>This is App Is Optimized For Desktop Screen Only.</p>
      </div>
    </>
  );
}
