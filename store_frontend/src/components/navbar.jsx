import { useState, useEffect } from "react";
import "../css/navbar.css";
import LiveClock from "./heper_navbar/liveclock";
export default function Navbar() {
  const [Nav_username, setNavUSerName] = useState("");

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
          setNavUSerName(res.user.name);
        }
      })
      .catch((error) => {
        return;
      });
  }, []);

  // capitalize the name
  const capitalize = (str) => {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
  };

  return (
    <>
      <div id="nav_container">
        <h2>Store Name</h2>

        <div id="nav_content">
          <p id="username">{capitalize(Nav_username)}</p>
          <div id="nav_time&date">
            <LiveClock />
          </div>
        </div>
      </div>
    </>
  );
}
