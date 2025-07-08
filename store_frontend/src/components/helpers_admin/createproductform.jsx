import React, { useState, useEffect } from "react";
import "../../css/helpers/create_prod.css";

export default function AddProductform({ setProductrefresh }) {
  const [prodName, setProdName] = useState("");
  const [prodSupplier, setProdSupplier] = useState("");
  const [prodBarcode, setProdBarcode] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodP_Price, setProdP_Price] = useState("");
  const [prodCategory, setProd_Category] = useState("");

  // error
  const [Error, setError] = useState("");

  //resonse handel method
  function handleResponse(res) {
    const { status, message } = res;

    const statusMap = {
      // "success" response
      success: () => {
        setProductrefresh(true);
        setProdName("");
        setProdSupplier("");
        setProdBarcode("");
        setProdStock("");
        setProdP_Price("");
        setProd_Category("");
        return;
      },
      failed: () => {
        setErrorLogin("Error Creating User");
        return;
      },
      NOT_VALID: () => {
        setErrorLogin("Please Provide Valid Values.");
        return;
      },
      UNAUTHORIZED: () => {
        setErrorLogin("Access Deined");
        return;
      },
      default: () => {
        setErrorLogin("Something Went Wrong.");
        return;
      },
    };
    (statusMap[status] || statusMap.default)(); // when send the req and on .then(res) section i am calling this function by passing the res vairable to it...now this line gets that res and if that status is from valid status of response then statusMap[status] varible will be called then how is the appropriate method is being called accorrding to status.
  }

  //request
  function Addproduct() {
    const token = localStorage.getItem("token");
    if (
      prodName === "" ||
      prodSupplier === "" ||
      prodBarcode === "" ||
      prodStock === "" ||
      prodP_Price === "" ||
      prodCategory === ""
    ) {
      setError("please provide all values.");
      return;
    }

    const prepare_data = {
      name: prodName,
      supplier: prodSupplier,
      category: prodCategory,
      stock: prodStock,
      barcode: prodBarcode,
      p_price: prodP_Price,
    };

    fetch("http://127.0.0.1:8000/api/product/add", {
      method: "POST",
      body: JSON.stringify(prepare_data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        return resp.json();
      })
      .then((res) => {
        handleResponse(res);
        // console.log(res);
        return;
      })
      .catch((error) => {
        return;
      });
  }

  // stop negative input for barcode stock and purchase price.
  function restrictPurchasePriceNagetive(e) {
    const newVAlue = e.target.value;
    if (newVAlue === "" || (!isNaN(newVAlue) && Number(newVAlue) >= 0)) {
      setProdP_Price(newVAlue);
    }
  }
  function restrictBarcodeNagetive(e) {
    const newVAlue = e.target.value;
    if (newVAlue === "" || (!isNaN(newVAlue) && Number(newVAlue) >= 0)) {
      setProdBarcode(newVAlue);
    }
  }
  function restrictaStockNagetive(e) {
    const newVAlue = e.target.value;
    if (newVAlue === "" || (!isNaN(newVAlue) && Number(newVAlue) >= 0)) {
      setProdStock(newVAlue);
    }
  }

  // DOM
  // display error
  useEffect(() => {
    if (Error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Error]);

  return (
    <>
      <div id="create_prod_container">
        <form action="">
          <div id="prod_entry">
            <label htmlFor="prod_name">Name:</label>
            <input
              type="text"
              name="prod_name"
              id="create_prod_name"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
            />
          </div>

          <div id="prod_entry">
            <label htmlFor="prod_supplier">Supplier/Company:</label>
            <input
              type="text"
              name="prod_supplier"
              id="create_prod_supplier"
              value={prodSupplier}
              onChange={(e) => setProdSupplier(e.target.value)}
            />
          </div>

          <div id="prod_entry">
            <label htmlFor="prod_barcode">Barcode:</label>
            <input
              type="number"
              min="0"
              name="prod_barcode"
              id="create_prod_barcode"
              value={prodBarcode}
              onChange={restrictBarcodeNagetive}
            />
          </div>

          <div id="prod_entry">
            <label htmlFor="prod_quantity">Stock:</label>
            <input
              type="number"
              min="0"
              name="prod_quantity"
              id="create_prod_quantity"
              value={prodStock}
              onChange={restrictaStockNagetive}
            />
          </div>

          <div id="prod_entry">
            <label htmlFor="category">Category :</label>
            <select
              name="category"
              id="create_prod_caetgory"
              value={prodCategory}
              onChange={(e) => setProd_Category(e.target.value)}
            >
              <option value=""></option>
              <option value="1">Essentail Goods</option>
              <option value="2">Snack/Beverage</option>
              <option value="3">Tobacco Product</option>
              <option value="4">Personal Care</option>
              <option value="5">Cleaning Product</option>
            </select>
          </div>

          <div id="prod_entry">
            <label htmlFor="prod_purchase_price">Purchase Price:</label>
            <input
              type="number"
              min="0"
              name="prod_purchase_price"
              id="create_prod_purchase_price"
              value={prodP_Price}
              onChange={restrictPurchasePriceNagetive}
            />
          </div>
          <p style={{ color: "red" }}> {Error ? Error : ""}</p>
          <button type="button" onClick={Addproduct} id="prod_create_btn">
            Add Product
          </button>
        </form>
      </div>
    </>
  );
}
