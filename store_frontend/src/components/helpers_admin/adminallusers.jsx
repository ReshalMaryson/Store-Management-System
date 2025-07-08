import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/helpers/showallusers.css";
import searchicon from "../../assets/images/search icon white.png";
import deleteicon from "../../assets/images/deleteicon.png";
import refreshicon from "../../assets/images/refreshicon.png";

export default function AdminAllUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userquery, setUserQuery] = useState("");
  const [usersearched, setUserSearched] = useState(false);
  const [showUdpateBlock, setUpdateBlock] = useState(false);

  // update user details.
  const [userID, setUserID] = useState("");
  const [updatename, setUpdateName] = useState("");
  const [updateemail, setUpdateEmail] = useState("");
  const [updateaddress, setUpdateAddress] = useState("");
  const [updatecity, setUpdateCity] = useState("");
  const [updatephone, setUpdatePhone] = useState("");
  const [updaterole, setUpdateRole] = useState("");

  const [Error, setError] = useState("");
  const [UpdateError, setUpdateError] = useState("");

  const token = localStorage.getItem("token");

  //request
  useEffect(() => {
    getUsers();
  }, []);

  // display error
  useEffect(() => {
    if (Error) {
      const timer = setTimeout(() => {
        getUsers();
        setError("");
        setUserQuery("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Error]);

  //get all users
  function getUsers() {
    fetch("http://127.0.0.1:8000/api/users", {
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
        setUsers(res.users);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // get searched user
  function SearchUser() {
    setUsers([]);
    if (userquery === "") {
      setError("Please Provide a Value");
      setUserQuery("");
      return;
    }
    const data = {
      query: userquery,
    };

    fetch("http://127.0.0.1:8000/api/users/query", {
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
          setUsers(res.data);
          setUserSearched(true);
          return;
        } else if (res.status === "failure") {
          setError(res.message);
          setUserSearched(false);
          return;
        }
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
        return;
      });
  }

  // update request
  function updateUser() {
    if (updatephone.length !== 11) {
      setUpdateError("Phone # Should be 11 Dgitis.");
      return;
    }
    if (updatename === "" || updatephone === "" || updaterole === "") {
      setUpdateError("Name, Phone, Role can`t be empty ");
      return;
    }

    const data = {
      userId: userID,
      updateName: updatename,
      updateAddress: updateaddress,
      updateCity: updatecity,
      updatePhone: updatephone,
      updateEmail: updateemail,
      updateRole: updaterole,
    };

    fetch("http://127.0.0.1:8000/api/user/update", {
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
          getUsers();
          closeUpdateBlock();
          return;
        }
      })
      .then((error) => {
        return;
      });
  }

  //delete user
  function deleteUser(ID) {
    const data = {
      id: ID,
    };

    console.log(data);
    fetch("http://127.0.0.1:8000/api/user/delete", {
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
          getUsers();
        }
      })
      .catch((error) => {
        return;
      });
  }

  //DOM

  // display error
  useEffect(() => {
    if (UpdateError) {
      const timer = setTimeout(() => {
        setUpdateError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [UpdateError]);

  // open update block
  function showUpdate(id, name, email, phone, address, city, role) {
    setUpdateBlock(true);
    setUpdateName(name);
    setUpdateAddress(address);
    setUpdateRole(role);
    setUpdateCity(city);
    setUserID(id);
    setUpdateEmail(email);
    setUpdatePhone(phone);
  }

  function closeUpdateBlock() {
    setUpdateBlock(false);
    setUpdateName("");
    setUpdateAddress("");
    setUpdateRole("");
    setUpdateCity("");
    setUserID("");
    setUpdateEmail("");
    setUpdatePhone("");
  }

  function goback() {
    users ? setUsers([]) : getUsers();
    getUsers();
    setUserSearched(false);
    setUserQuery("");
    setError("");
    return;
  }
  return (
    <>
      <div id="alluser_cont" className={showUdpateBlock ? "active" : ""}>
        <p id="total_users_p">Users: ({users.length})</p>
        {/* search bar */}
        <div id="searchuserbar">
          <input
            type="search"
            name="query"
            id="search_user_input"
            placeholder="Name , Role"
            value={userquery}
            onChange={(e) => setUserQuery(e.target.value)}
          />

          <div id="search_user_img_wrapper" onClick={SearchUser}>
            <img src={searchicon} alt="search user" id="search_user_img" />
          </div>
        </div>
        <p style={{ color: "red", fontSize: "0.7rem", textAlign: "center" }}>
          {Error}
        </p>

        {/* clear search */}
        <div id="gobackseach" className={usersearched ? "active" : ""}>
          <p id="p_clear_search" onClick={goback}>
            Clear Search
          </p>
        </div>
        <div className="refreshusers">
          <img
            src={refreshicon}
            alt=""
            onClick={() => {
              getUsers();
              setUserSearched(false);
              setUserQuery("");
            }}
            title="Refresh Data"
            aria-label="Refresh Data"
          />
        </div>

        {/* show all users block */}
        <div id="show_user">
          <ul id="users_items_title">
            <li id="title_name">Name</li>
            <li id="title_barcode">Email</li>
            <li>Address</li>
            <li>City</li>
            <li>Phone#</li>
            <li>Role</li>
            <li id="title_options">Options</li>
          </ul>

          <div id="users_wrapper">
            {users.length > 0 ? (
              users.map((user) => {
                return (
                  <div id="user" key={user.id}>
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                    <p>{user.address}</p>
                    <p> {user.city}</p>
                    <p> {user.phone}</p>
                    <p> {user.role}</p>

                    <div id="users_controls">
                      <img
                        src={deleteicon}
                        width="20"
                        style={{ cursor: "pointer" }}
                        alt=""
                        onClick={() => deleteUser(user.id)}
                      />
                      <button
                        type="button"
                        id="show_updatebox_btn"
                        onClick={() =>
                          showUpdate(
                            user.id,
                            user.name,
                            user.email,
                            user.phone,
                            user.address,
                            user.city,
                            user.role
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
      </div>

      {/* update records */}
      <div
        id="update_user_block"
        className={showUdpateBlock ? "active" : ""}
        style={{ marginTop: "20px" }}
      >
        <h3>Update User</h3>
        <ul id="update_users_items_title">
          <li id="title_name">Name</li>
          <li id="title_barcode">Email</li>
          <li>Address</li>
          <li>City</li>
          <li>Phone#</li>
          <li>Role</li>
          <li id="title_options">Options</li>
        </ul>

        <div id="user_update_fields">
          <div className="update_username_entry update_entry">
            <input
              type="text"
              name=""
              id="update_user_name"
              value={updatename}
              onChange={(e) => setUpdateName(e.target.value)}
            />
          </div>

          <div className="update_useremail_entry update_entry">
            <input
              type="text"
              id="update_email"
              value={updateemail}
              onChange={(e) => setUpdateEmail(e.target.value)}
            />
          </div>

          <div className="update_useraddress_entry update_entry">
            <input
              type="text"
              id="update_address"
              value={updateaddress}
              onChange={(e) => setUpdateAddress(e.target.value)}
            />
          </div>

          <div className="update_usercity_entry update_entry">
            <input
              type="text"
              id="update_city"
              value={updatecity}
              onChange={(e) => setUpdateCity(e.target.value)}
            />
          </div>

          <div className="update_userphone_entry update_entry">
            <input
              type="text"
              id="update_phone"
              value={updatephone}
              onChange={(e) => setUpdatePhone(e.target.value)}
            />
          </div>

          <div className="update_userrole_entry update_entry">
            <select
              id="update_role"
              value={updaterole}
              onChange={(e) => setUpdateRole(e.target.value)}
            >
              <option value=""></option>
              <option value="admin">admin</option>
              <option value="cashier">cashier</option>
              <option value="salesperson">sales Person</option>
            </select>
          </div>

          <div className="update_controls">
            <button
              type="button"
              onClick={updateUser}
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
            <p style={{ color: "red", fontSize: "0.7rem" }}>{UpdateError}</p>
          </div>
        </div>
      </div>
    </>
  );
}
