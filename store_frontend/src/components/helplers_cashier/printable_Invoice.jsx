import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../css/helpers/printinvoice.css";

export default function PrintInvoice() {
  const { billID, staffRole, staffName } = useParams();
  const [billPrint, setBillPrint] = useState(null); // items of printable bill

  useEffect(() => {
    searchPrintableBill();
  }, []);

  useEffect(() => {
    // Wait a tick to ensure DOM is painted
    if (billPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      return;
    }

    // clean-up just in case
  }, [billPrint]);

  // search bill  by id
  function searchPrintableBill() {
    const data = {
      id: billID,
    };

    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/bills/cashier/search", {
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
        setBillPrint(res.data);
      })
      .catch((error) => {
        setError(error);
      });
  }

  // format date and time
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", // 👈 this changes "June" to "Jun"
      day: "numeric",
    });

    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart} | ${timePart}`;
  }

  return (
    <>
      {billPrint ? (
        <div id="print_conatiner">
          <div id="header">
            <h2>Store Name</h2>
            <p>Contact # : 23462627161</p>
          </div>

          <div id="sale_receipt">
            <div id="billinguser">
              <p>{staffRole}</p>
              <p>{staffName}</p>
            </div>
            <div id="billid">
              <p>Bill ID </p>
              <p>STR-{billID}</p>
            </div>
            <div id="dateandtime">
              <p>Date&time</p>
              <p>{formatDateTime(billPrint.created_at)}</p>
            </div>
            <div id="cutomer">
              <p>Customer</p>
              <p>{billPrint.customer.name}</p>
            </div>

            <div id="invoice_content">
              <ul id="printbill_items_title">
                <li>Item</li>
                <li>Qty</li>
                <li>Rate</li>
                <li>Amount</li>
              </ul>

              {billPrint.bill_items.map((print_item) => {
                return (
                  <div id="print_items" key={print_item.id}>
                    <p id="item_name">{print_item.name}</p>
                    <p>{print_item.quantity}</p>
                    <p>{print_item.price_per_unit}</p>
                    <p>{print_item.total_price}</p>
                  </div>
                );
              })}
            </div>

            <hr />
            <div id="amountsdetails">
              <div id="subtotal">
                <p>Subtotal</p>
                <p>{billPrint.subtotal}</p>
              </div>
              <div id="printdiscount">
                <p>Discount</p>
                <p>{billPrint.discount}%</p>
              </div>
              <div id="Billtotal">
                <p>Total</p>
                <p>{billPrint.total}</p>
              </div>
            </div>

            <p
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Thank You For Shopping With Us!
            </p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
