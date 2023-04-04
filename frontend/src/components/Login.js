// import React, { useState } from "react";
// import axios from "axios";
// import api from "../config/api";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const TOKEN_KEY = "my_token";

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       const response = await api.post("/login", { email, password });

//       localStorage.setItem(TOKEN_KEY, response.data.token);
//       window.location.href = "http://localhost:8000/dashboard";
//     } catch (error) {
//       if (error.response) {
//         if (error.response.status === 401) {
//           // handle Unauthorized error
//           alert(error.response.data.error);
//         } else if (error.response.status === 429) {
//           // handle rate-limited error
//           console.log("you got rate limited");
//           alert(error.response.data.error.message);
//         } else {
//           console.error(error);
//         }
//       }
//     }
//   };

//   return (
//     <div>
//       <h1>Login updated</h1>
//       <div>
//         password must have at least one uppercase letter, one lowercase letter,
//         one digit, and is at least 8 characters long:
//       </div>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Email:</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(event) => setEmail(event.target.value)}
//           />
//         </div>
//         <div>
//           <label>Password:</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(event) => setPassword(event.target.value)}
//           />
//         </div>
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;

// import api from "../config/api";
// import { Navigate } from "react-router-dom";

import React, { useState } from "react";
import axios from "axios";
// import api from "../config/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const TOKEN_KEY = "my_token";

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      // };
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });
      const { token } = await response.data;
      localStorage.setItem("token", token);
      // setToken(token);

      alert("token: " + localStorage.getItem("token"));

      window.location.href = "http://localhost:8000/dashboard";
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          // handle Unauthorized error
          alert(error.response.data.error);
        } else if (error.response.status === 429) {
          // handle rate-limited error
          console.log("you got rate limited");
          alert(error.response.data.error.message);
        } else {
          console.error(error);
        }
      }
    }
  };

  return (
    <div>
      <h1>Login updated</h1>
      <div>
        password must have at least one uppercase letter, one lowercase letter,
        one digit, and is at least 8 characters long:
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
