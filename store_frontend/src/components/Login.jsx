import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
export default function Login() {
  //
  const navigate = useNavigate();

  // user credentials
  const [login_name, setLogin_name] = useState("");
  const [login_password, setLogin_password] = useState("");

  //DOM Vairables
  const [ErrorLogin, setErrorLogin] = useState(null);

  // method

  function handleResponse(res) {
    const { status, data, token } = res;

    const statusMap = {
      // "success" response
      success: () => {
        localStorage.setItem("token", token);

        setErrorLogin("");
        //routing according to role.
        if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/cashier");
        }
        return;
      },
      incorrect: () => {
        setErrorLogin("Incorrect UserName Or Password.");
        return;
      },
      notvalid: () => {
        setErrorLogin("Please Provide Valid Values.");
        return;
      },
      default: () => {
        setErrorLogin("Something Went Wrong.");
        return;
      },
    };
    (statusMap[status] || statusMap.default)(); // when send the req and on .then(res) section i am calling this function by passing the res vairable to it...now this line gets that res and if that status is from valid status of response then statusMap[status] varible will be called then how is the appropriate method is being called accorrding to status.
  }

  // requests
  function loginUser() {
    if (login_name === "" || login_password === "") {
      setErrorLogin("please provide both values");
      return;
    }

    const prepare_login_data = {
      user_name: login_name,
      user_pass: login_password,
    };

    const data = JSON.stringify(prepare_login_data);

    fetch("http://127.0.0.1:8000/api/user/login", {
      method: "POST",
      body: data,
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => {
        return resp.json();
      })
      .then((res) => {
        handleResponse(res);
        return;
      })
      .catch((error) => {
        return;
      });
  }

  return (
    <>
      <div id="conatiner_wrapper">
        <div id="login_container">
          <h1>Login</h1>
          <form action="">
            <div id="input_wrapper">
              <label htmlFor="name">Name </label>
              <input
                type="text"
                name="name"
                id="input_login_name"
                value={login_name}
                onChange={(e) => {
                  setLogin_name(e.target.value);
                }}
              />
            </div>

            <div id="input_wrapper">
              <label htmlFor="password">Password </label>
              <input
                type="password"
                name="password"
                id="inpu_login_password"
                value={login_password}
                onChange={(e) => {
                  setLogin_password(e.target.value);
                }}
              />
            </div>
            <p style={{ color: "red", fontSize: "0.8rem" }}> {ErrorLogin}</p>
            <button type="button" id="login_btn" onClick={loginUser}>
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
