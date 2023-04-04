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

import React, { useState } from "react";
import axios from "axios";
import api from "../config/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const TOKEN_KEY = "my_token";

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/login", { email, password });

      localStorage.setItem(TOKEN_KEY, response.data.token);
      console.log("Token in localStorage: ", localStorage.getItem(TOKEN_KEY));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
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
