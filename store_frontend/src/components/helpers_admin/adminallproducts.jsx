import React, { useState, useEffect } from "react";
import "../../css/helpers/showallprod.css";
import goback from "../../assets/images/arrow.png";
import searchicon from "../../assets/images/search icon white.png";
import deleteicon from "../../assets/images/deleteicon.png";
import refreshicon from "../../assets/images/refreshicon.png";

export default function AdminAllProducts({
  refreshproducts,
  setProductrefresh,
}) {
  const [prodQuery, setProdQuery] = useState("");
  const [proprodSearchResponseitems, setProdSearchResponseItems] = useState([]);
  const [prodSearchResponse, setProdSearchResponse] = useState(false);
  const [Errorquery, setErrorQuery] = useState("");
  const [showUdpateBlock, setUpdateBlock] = useState(false);
  const [totalProd, setTotalProd] = useState("");

  // update user details.
  const [prodID, setUserID] = useState("");
  const [updatename, setUpdateName] = useState("");
  const [updatebarcode, setUpdateBarcode] = useState("");
  const [updatecategory, setUpdateCategory] = useState("");
  const [updatesupplier, setUpdateSupplier] = useState("");
  const [updatestock, setUpdateStock] = useState("");
  const [updatepurchase, setUpdatePurchase] = useState("");

  // pagination setup
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, links: [] });

  const token = localStorage.getItem("token");

  //request
  // get all products
  useEffect(() => {
    getProducts(pagination.current_page);
  }, [refreshproducts, pagination.current_page]);

  //get all products
  function getProducts(pageNum = 1) {
    fetch(`http://127.0.0.1:8000/api/products?page=${pageNum}`, {
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
        setProducts(res.products.data);
        setTotalProd(res.products.total);
        setPagination({
          current_page: res.products.current_page,
          links: res.products.links,
        });
        refreshproducts ? setProductrefresh(false) : null;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // pagination controllers
  const handlePageClick = (url) => {
    if (!url) return;
    const page = new URL(url).searchParams.get("page");
    setPagination((prev) => ({ ...prev, current_page: Number(page) }));
  };

  // get search product.
  function SearchProd() {
    if (prodQuery === "") {
      setErrorQuery("Please Provide a Value");
      return;
    }
    const data = {
      query: prodQuery,
    };

    fetch("http://127.0.0.1:8000/api/products/query", {
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
          setProdQuery("");
          setProdSearchResponseItems(res.product);
          setProdSearchResponse(true);
          setUpdateBlock(false);
          setErrorQuery("");
        } else if (res.status === "Notfound") {
          setErrorQuery(res.message);
          setProdQuery("");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // delete product
  function deletePord(ID) {
    const data = {
      id: ID,
    };

    fetch("http://127.0.0.1:8000/api/product/delete", {
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
          getProducts();
        } else if (res.status === "failure") {
          console.log(res.message);
        }
      })
      .catch((error) => {
        return;
      });
  }

  //  update prod
  function update() {
    // validating category
    let validCategory = null;
    if (updatecategory === "essential_goods") {
      validCategory = "1";
    } else if (updatecategory === "Snacks_Beverage") {
      validCategory = "2";
    } else if (updatecategory === "tobacco_product") {
      validCategory = "3";
    } else if (updatecategory === "personal_care") {
      validCategory = "4";
    } else if (updatecategory === "cleaning_product") {
      validCategory = "5";
    }
    const data = {
      prodid: prodID,
      name: updatename,
      barcode: updatebarcode,
      supplier: updatesupplier,
      category: validCategory, // null
      stock: updatestock,
      purchase: updatepurchase,
    };

    fetch("http://127.0.0.1:8000/api/product/update", {
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
          getProducts();
          closeUpdateBlock();
          return;
        }
      })
      .then((error) => {
        return;
      });
  }
  //DOM
  function showUpdate(id, name, barcode, category, supplier, stock, purchase) {
    setUpdateBlock(true);
    setUserID(id);
    setUpdateName(name);
    setUpdateBarcode(barcode);
    setUpdateCategory(category);
    setUpdateSupplier(supplier);
    setUpdateStock(stock);
    setUpdatePurchase(purchase);
    setProdSearchResponse(false);
  }

  // display error
  useEffect(() => {
    if (Errorquery) {
      const timer = setTimeout(() => {
        setErrorQuery("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Errorquery]);

  function closeUpdateBlock() {
    setUpdateBlock(false);
    setUserID("");
    setUpdateName("");
    setUpdateBarcode("");
    setUpdateCategory("");
    setUpdateSupplier("");
    setUpdateStock("");
    setUpdatePurchase("");
  }

  return (
    <>
      <div
        id="allprod_contaier"
        style={{ margin: "10px" }}
        className={prodSearchResponse || showUdpateBlock ? "active" : ""}
      >
        <p style={{ fontSize: "0.9rem", marginLeft: "10px" }}>
          Products : {totalProd}
        </p>
        {/* search products */}
        <div id="search_product_cont">
          <input
            type="search"
            id="search_prod_input"
            name="produquery"
            placeholder="Name, Barcode, Price"
            value={prodQuery}
            onChange={(e) => setProdQuery(e.target.value)}
          />
          <div id="search_prod_img_wrapper" onClick={SearchProd}>
            <img src={searchicon} alt="search product" id="search_prod_img" />
          </div>
          <br />
        </div>
        <p style={{ color: "red", fontSize: "0.7rem", textAlign: "center" }}>
          {Errorquery}
        </p>

        <div className="refreshprod">
          <img
            src={refreshicon}
            alt=""
            title="Refresh Data"
            aria-label="Refresh Data"
            onClick={() => getProducts(1)}
          />
        </div>

        {/* show all product block */}
        <div id="show_prod">
          <ul id="prods_items_title">
            <li id="title_name">Name</li>
            <li id="title_barcode"> Barcode</li>
            <li>Category</li>
            <li>Supplier</li>
            <li>Stock</li>
            <li>Purchase</li>
            <li>Selling</li>
            <li id="title_options">Options</li>
          </ul>
          <div id="prod_wrapper">
            {products.length > 0 ? (
              products
                .slice()
                .reverse()
                .map((item) => {
                  return (
                    <div id="prod" key={item.id}>
                      <p id="p_name">{item.name}</p>
                      <p id="p_barcode">{item.barcode}</p>{" "}
                      <p>{item.category?.category}</p>{" "}
                      <p id="p_supplier"> {item.supplier_name}</p>
                      <p id="p_stock"> {item.quantity}</p>
                      <p id="p_purchase"> {item.purchase_price}</p>
                      <p id="p_selling"> {item.selling_price}</p>
                      {/* controls */}
                      <div id="prod_controls">
                        <img
                          src={deleteicon}
                          width="20"
                          style={{ cursor: "pointer" }}
                          alt=""
                          onClick={() => deletePord(item.id)}
                        />
                        <button
                          type="button"
                          id="show_updatebox_btn"
                          onClick={() =>
                            showUpdate(
                              item.id,
                              item.name,
                              item.barcode,
                              item.category.category,
                              item.supplier_name,
                              item.quantity,
                              item.purchase_price
                            )
                          }
                        >
                          Edit
                        </button>
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

      {/* update product block */}
      <div
        id="update_prod_block"
        className={showUdpateBlock ? "active" : ""}
        style={{ marginTop: "20px" }}
      >
        <h3>Update Product</h3>
        <ul id="update_prods_items_title">
          <li id="title_name">Name</li>
          <li id="title_barcode"> Barcode</li>
          <li>Category</li>
          <li>Change Category</li>
          <li>Supplier</li>
          <li>Stock</li>
          <li>Purchase</li>
          <li id="title_options">Options</li>
        </ul>

        <div id="update_fields">
          <div className="update_prodname_entry update_entry">
            <input
              type="text"
              name=""
              id="update_prod_name"
              value={updatename}
              onChange={(e) => setUpdateName(e.target.value)}
            />
          </div>

          <div className="update_prodbarcode_entry update_entry">
            <input
              type="text"
              name=""
              id="update_barcode"
              value={updatebarcode}
              onChange={(e) => setUpdateBarcode(e.target.value)}
            />
          </div>

          <div className="update_showprod_category update_entry">
            <input
              type="text"
              value={updatecategory}
              onChange={(e) => setUpdateCategory(e.target.value)}
              readOnly
            />
          </div>

          <div className="update_prodctategory_entry update_entry">
            <select
              id="update_caetgory"
              value={updatecategory}
              onChange={(e) => setUpdateCategory(e.target.value)}
            >
              <option value=""></option>
              <option value="essential_goods">1. Essentail Goods</option>
              <option value="Snacks_Beverage">2. Snack/Beverage</option>
              <option value="tobacco_product">3. Tobacco Product</option>
              <option value="personal_care">4. Personal Care</option>
              <option value="cleaning_product">5. Cleaning Product</option>
            </select>
          </div>

          <div className="update_prodsupplier_entry update_entry">
            <input
              type="text"
              name=""
              id="update_supplier"
              value={updatesupplier}
              onChange={(e) => setUpdateSupplier(e.target.value)}
            />
          </div>

          <div className="update_prodstock_entry update_entry">
            <input
              type="text"
              name=""
              id="update_stock"
              value={updatestock}
              onChange={(e) => setUpdateStock(e.target.value)}
            />
          </div>

          <div id="update" className="update_prodpurchase_entry update_entry">
            <input
              type="text"
              name=""
              id="update_purchase"
              value={updatepurchase}
              onChange={(e) => setUpdatePurchase(e.target.value)}
            />
          </div>
          <div className="update_controls">
            <button
              type="button"
              onClick={update}
              className="update_btn_update"
            >
              Update
            </button>
            <button
              type="button"
              onClick={closeUpdateBlock}
              className="update_btn_cancle"
            >
              Cancle
            </button>
          </div>
        </div>
      </div>

      {/* search container */}
      {prodSearchResponse ? (
        <div id="goback">
          <img
            src={goback}
            width="25"
            alt=""
            onClick={() => {
              setProdSearchResponse(false);
              setProdSearchResponseItems([]);
              setProdQuery("");
            }}
            title="Back"
            aria-label="Back"
          />
        </div>
      ) : null}
      <div className="searchblock_wrap">
        {prodSearchResponse ? (
          <div id="show_prod">
            <ul id="prods_items_title">
              <li id="title_name">Name</li>
              <li id="title_barcode"> Barcode</li>
              <li>Category</li>
              <li>Supplier</li>
              <li>Stock</li>
              <li>Purchase</li>
              <li>Selling</li>
              <li id="title_options">Options</li>
            </ul>
            <div id="prod_wrapper">
              {proprodSearchResponseitems.length > 0 ? (
                proprodSearchResponseitems.map((searchitem) => {
                  return (
                    <div id="prod" key={searchitem.id}>
                      <p id="p_name">{searchitem.name}</p>
                      <p id="p_barcode">{searchitem.barcode}</p>{" "}
                      <p>{searchitem.category?.category}</p>{" "}
                      <p id="p_supplier"> {searchitem.supplier_name}</p>
                      <p id="p_stock"> {searchitem.quantity}</p>
                      <p id="p_purchase"> {searchitem.purchase_price}</p>
                      <p id="p_selling"> {searchitem.selling_price}</p>
                      <div id="prod_controls">
                        <img
                          src={deleteicon}
                          width="20"
                          style={{ cursor: "pointer" }}
                          alt=""
                          onClick={() => deletePord(searchitem.id)}
                        />
                        <button
                          type="button"
                          id="show_updatebox_btn"
                          onClick={() =>
                            showUpdate(
                              searchitem.id,
                              searchitem.name,
                              searchitem.barcode,
                              searchitem.category.category,
                              searchitem.supplier_name,
                              searchitem.quantity,
                              searchitem.purchase_price
                            )
                          }
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: "center" }}>Loading...</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
