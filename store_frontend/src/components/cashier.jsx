import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/cashier.css";
import Inovice from "./helplers_cashier/invoice";
import Navbar from "./navbar";

export default function Cashier() {
  const navigate = useNavigate();
  const [ShowBill_cont, setBill_cont] = useState(false);
  const [Bill_created_response, setBillCreatedResponse] = useState(false);
  const [Error, setError] = useState("");

  // bill item search
  const [query, setQuery] = useState("");
  const [QueryRes, setQueryRes] = useState([]);

  // bill data variables
  const [items, setItems] = useState([]);
  var bill_item_quantity = 1;

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
          if (res.user.role !== "cashier" && res.user.role !== "admin") {
            navigate("/");
          }
        }
      })
      .catch((error) => {
        return;
      });
  }, []);

  // DOM manuplation methods
  function showBillContainer() {
    setBill_cont((prev) => !prev);
  }
  function GetBillResponse(value) {
    setBillCreatedResponse(value);
  }

  function addToList(id, name, price, qty) {
    const PreExistedItem = items.some((item) => item.name === name);
    if (PreExistedItem) {
      alert("Item Exists In Bill Already");
      setQuery("");
      return;
    }
    setItems((prev) => [...prev, { id, name, price, qty }]);
    setQuery("");
    return;
  }

  // reqests.

  //get bill item request
  useEffect(() => {
    if (query === "") {
      setQueryRes([]);
      return;
    }

    const debounce = setTimeout(() => {
      const data = {
        query: query,
      };

      fetch("http://127.0.0.1:8000/api/products/query", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((resp) => {
          return resp.json();
        })
        .then((res) => {
          setQueryRes(res.product);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 200);

    return () => clearTimeout(debounce);
  }, [query]);

  function logoutCashier() {
    const token = localStorage.getItem("token");
    if (token) {
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
      return;
    } else {
      console.log("token not found");
      return;
    }
  }
  return (
    <>
      <div id="content_wrapper">
        <div id="cashier_nav">
          <Navbar />
        </div>

        <h1>Cashier</h1>
        <div id="cashier_accessbility">
          <button
            type="button"
            id="btn_makebill"
            onClick={showBillContainer}
            className={ShowBill_cont ? "active" : ""}
          >
            New Bill
          </button>
          <button type="button" onClick={logoutCashier}>
            logout
          </button>
        </div>

        <div
          id="bill_container"
          className={ShowBill_cont && !Bill_created_response ? "active" : ""}
        >
          <div id="search_input">
            <label htmlFor="bill_product">Search Item</label>
            <input
              type="search"
              name="bill_product"
              placeholder="Name or Barcode"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
          </div>

          {/* search response */}
          <div
            id="searched_prod_container"
            className={QueryRes.length > 0 ? "active" : ""}
          >
            <ul
              id="product_title"
              className={QueryRes.length > 0 ? "active" : ""}
            >
              <li>ID</li>
              <li>Name</li>
              <li>Barcode</li>
              <li>Price</li>
            </ul>
            <div className="prod_wrapper">
              {QueryRes.length > 0 ? (
                QueryRes.map((item) => {
                  return (
                    <div
                      id="show_searched_products"
                      onClick={() =>
                        addToList(
                          item.id,
                          item.name,
                          item.selling_price,
                          bill_item_quantity
                        )
                      }
                      key={item.id}
                    >
                      <p id="found_prod_id">{item.id} </p>
                      <p id="found_prod_name"> {item.name} </p>
                      <p id="found_prod_barcode">{item.barcode} </p>
                      <p id="found_prod_name"> {item.selling_price}</p>
                    </div>
                  );
                })
              ) : (
                <p>No Products found</p>
              )}
            </div>
          </div>
          <div id="invoice" className={ShowBill_cont ? "active" : ""}>
            <Inovice
              BillItems={items}
              SetBillItems={setItems}
              tellparent={GetBillResponse}
              refreshBillContainer={setBill_cont}
            />
          </div>
        </div>
      </div>

      <div className="screensize_caution1">
        <p>This is App Is Optimized For Desktop Screen Only.</p>
      </div>
    </>
  );
}
