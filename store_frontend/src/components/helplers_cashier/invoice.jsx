import React, { useState, useEffect, useRef } from "react";
import PrintInvoice from "./printable_Invoice";
import { useNavigate } from "react-router-dom";
import "../../css/helpers/invoice.css";
import deleteimg from "../../assets/images/deleteicon.png";

export default function Inovice({ BillItems, SetBillItems }) {
  const navigate = useNavigate();

  // const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");
  const [Error, setError] = useState("");
  // const [BillCreated, setBillCreated] = useState(false);
  // const [BillResponse, setBillResponse] = useState();
  // const [itemsCopy, setItemsCopy] = useState([]);
  // customer
  const [custName, setCustName] = useState("Take Away");
  const [custPhone, setCustPhone] = useState("");

  // staff
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffId, setStaffId] = useState("");

  // for bill
  const [billDiscount, setBillDiscount] = useState(0);

  // calculating the total amount of the added items in bill.
  const BillsubTotal = BillItems.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  const discountAmount = Math.floor(BillsubTotal * (billDiscount / 100));
  const totalAmount = BillsubTotal - discountAmount;

  //ref to keep invoice item scrollbar at the bottom
  const itemContainerRef = useRef(null);

  // get user id and role
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
          if (res.user.role !== "cashier") {
            navigate("/");
          }
          setStaffId(res.user.id);
          setStaffName(res.user.name);
          setStaffRole(res.user.role);
        }
      })
      .catch((error) => {
        return;
      });
  }, []);

  useEffect(() => {
    if (itemContainerRef.current) {
      itemContainerRef.current.scrollTop =
        itemContainerRef.current.scrollHeight;
    }
  }, [BillItems]);

  // remove item from invoice
  function removeItem(id_delete) {
    // filter deletes the item where the condition is true and returns new array
    // in this filter we are getting new array without the id of item we sent
    // filter itrates all the elements of the array to find match he condition.
    // here item.id is the id of the current itration element and id_delete is the   one we sent to delete is matched.
    SetBillItems((prev) => prev.filter((item) => item.id !== id_delete));
  }

  // function Clear inputs after a bill is created
  function ClearFields() {
    setCustPhone("");
    setCustName("Take Away");
    setBillDiscount(0);
    SetBillItems([]);
  }

  // requests.

  // make bill
  function MakeBill() {
    if (custPhone.length > 11) {
      setError("Phone number should be of 11 digits only");
      setCustPhone("");
      return;
    }

    const data = {
      cust_name: custName,
      cust_phone: custPhone,
      staff_id: staffId,
      subtotal: BillsubTotal,
      discount: billDiscount,
      total: totalAmount,
      items: BillItems,
    };

    console.log(data);
    fetch("http://127.0.0.1:8000/api/bill/create", {
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
          ClearFields();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function MakeBillandPrint() {
    const newTab = window.open("", "_blank");

    if (custPhone.length > 11) {
      setError("Phone number should be of 11 digits only");
      setCustPhone("");
      return;
    }

    const data = {
      cust_name: custName,
      cust_phone: custPhone,
      staff_id: staffId,
      subtotal: BillsubTotal,
      discount: billDiscount,
      total: totalAmount,
      items: BillItems,
    };

    fetch("http://127.0.0.1:8000/api/bill/create", {
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
          const printUrl = `/invoice/print/${
            res.bill_id
          }/${staffRole}/${encodeURIComponent(staffName)}`;

          newTab.location.href = printUrl;
          ClearFields();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // cancel bill
  function cancelBill() {
    ClearFields();
  }

  return (
    <>
      <div id="invoice_cont">
        <div id="inovice_content">
          <h1>Invoice</h1>
          <p id="cart_title">
            <b> Items ({BillItems.length})</b>
          </p>
          <div id="invoice_items_title">
            <p>Name</p>
            <p>Price</p>
            <p>Qty</p>
            <p>Remove</p>
          </div>
          <div id="invoice_item_wrapper" ref={itemContainerRef}>
            {BillItems.length > 0 ? (
              BillItems.map((product, index) => {
                return (
                  <div id="invoice_item" key={product.id}>
                    <div id="item_info">
                      <p> {product.name} </p>
                    </div>
                    <div id="item_info" className="item_info_price">
                      <p> {product.price} </p>
                    </div>

                    <div id="item_info">
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        id="input_qty"
                        value={product.qty} // qty is a const variable
                        onChange={(e) => {
                          const showQty = Number(e.target.value);
                          SetBillItems((prev) =>
                            prev.map((it, idx) =>
                              idx === index ? { ...it, qty: showQty } : it
                            )
                          );
                        }}
                      />
                    </div>

                    <img
                      src={deleteimg}
                      width="20"
                      alt=""
                      onClick={() => removeItem(product.id)}
                      style={{ cursor: "pointer" }}
                      title="Remove Item"
                      aria-label="Remove Item"
                    />
                  </div>
                );
              })
            ) : (
              <p style={{ marginTop: "5px" }}>Add Items In Ivoice</p>
            )}
          </div>
          <hr />
          {BillItems.length > 0 ? (
            <div id="invoice_customer">
              <div>
                <label htmlFor="customer_name">Customer </label>
                <input
                  type="text"
                  name="customer_name"
                  id="invoice-customer-name"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                />
              </div>
              <br />
              <div>
                <label htmlFor="customer_phone">Customer # </label>
                <input
                  type="number"
                  name="customer_phone"
                  id="invoice-customer-phone"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <p></p>
          )}
          {BillItems.length > 0 ? (
            <>
              <div id="discount">
                <p id="invoice_subtotal">
                  SubTotal : {BillsubTotal.toFixed(2)}
                </p>
                <div id="invoice_discount">
                  <label htmlFor="bill_discount" id="invoice_discount_lable">
                    Discount % :{" "}
                  </label>
                  <input
                    type="number"
                    name="bill_discount"
                    value={billDiscount}
                    onChange={(e) => setBillDiscount(e.target.value)}
                  />
                </div>

                <p id="invoice_total">Total : {totalAmount} </p>
              </div>

              <hr />
              <p
                style={{
                  color: "red",
                  fontFamily: "sans-serif",
                  fontSize: "0.8rem",
                }}
              >
                {" "}
                {Error ? Error : null}
              </p>
              <div id="invoice_controls">
                <button
                  type="button"
                  onClick={cancelBill}
                  id="invoice_btn_cancel"
                >
                  Cancel Bill
                </button>
                <div id="create_option_btn">
                  <button
                    type="button"
                    onClick={MakeBill}
                    id="invoice_btn_create"
                  >
                    Create Bill
                  </button>

                  <button
                    type="button"
                    onClick={MakeBillandPrint}
                    id="invoice_btn_create"
                  >
                    Create & Print
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </>
  );
}
