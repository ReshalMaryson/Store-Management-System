import React, { useState, useEffect } from "react";
import "../../css/helpers/create_user.css";

export default function CreateUserForm() {
  // create use form
  const [createUser_name, setUserName] = useState("");
  const [createUser_phone, setUserPhone] = useState("");
  const [createUser_email, setUserEmail] = useState("");
  const [createUser_address, setUserAddress] = useState("");
  const [createUser_city, setUserCity] = useState("");
  const [createUser_role, setUserRole] = useState("");
  const [createUser_pass, setUserPass] = useState("");
  const [message, setMessage] = useState("");

  //clear feild after response.
  function clearFields() {
    setUserName("");
    setUserPhone("");
    setUserEmail("");
    setUserAddress("");
    setUserCity("");
    setUserRole("");
    setUserPass("");
  }

  // request
  function sendData() {
    if (
      createUser_name === "" ||
      createUser_phone === "" ||
      createUser_email === "" ||
      createUser_address === "" ||
      createUser_city === "" ||
      createUser_role === "" ||
      createUser_pass === ""
    ) {
      setMessage("please provide all values.");
      return;
    }

    const token = localStorage.getItem("token");
    const prepare_data = {
      name: createUser_name,
      phone: createUser_phone,
      email: createUser_email,
      address: createUser_address,
      city: createUser_city,
      role: createUser_role,
      password: createUser_pass,
    };

    fetch("http://127.0.0.1:8000/api/user/create", {
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
        if (res.status === "created") {
          clearFields();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  //restirct nagetive number for input phone
  function restrictPhoneNagetive(e) {
    const newVAlue = e.target.value;
    if (newVAlue === "" || (!isNaN(newVAlue) && Number(newVAlue) >= 0)) {
      setUserPhone(newVAlue);
    }
  }

  // DOM

  // display error
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div id="create_user_container">
        {/* <h1>Create New User</h1> */}
        <form action="">
          <div id="user_entry">
            <label htmlFor="usercreate_name">Name</label>
            <input
              type="text"
              name="usercreate_name"
              value={createUser_name}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
          </div>

          <div id="user_entry">
            <label htmlFor="usercreate_phone">Phone</label>
            <input
              type="number"
              min="0"
              name="usercreate_phone"
              value={createUser_phone}
              onChange={restrictPhoneNagetive}
            />
          </div>

          <div id="user_entry">
            <label htmlFor="usercreate_email">Email</label>
            <input
              type="email"
              name="usercreate_email"
              value={createUser_email}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
            />
          </div>

          <div id="user_entry">
            <label htmlFor="usercreate_address">Address</label>
            <input
              type="text"
              name="usercreate_address"
              value={createUser_address}
              onChange={(e) => {
                setUserAddress(e.target.value);
              }}
            />
          </div>

          <div id="user_entry">
            <label htmlFor="usercreate_city">City</label>
            <input
              type="text"
              name="usercreate_city"
              value={createUser_city}
              onChange={(e) => {
                setUserCity(e.target.value);
              }}
            />
          </div>

          <div id="user_entry" className="role_entry">
            <label htmlFor="usercreate_role">Role</label>
            <select
              name="usercreate_role"
              id=""
              value={createUser_role}
              onChange={(e) => {
                setUserRole(e.target.value);
              }}
            >
              <option value="none"></option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="salesperson">Sales Person</option>
            </select>
          </div>

          <div id="user_entry">
            <label htmlFor="usercreate_password">Password</label>
            <input
              type="text"
              name="usercreate_password"
              value={createUser_pass}
              onChange={(e) => {
                setUserPass(e.target.value);
              }}
            />
          </div>
          <br />
          <p style={{ color: "red", width: "100%" }}>{message}</p>
          <button type="button" id="user_create_btn" onClick={sendData}>
            Create
          </button>
        </form>
      </div>
    </>
  );
}
