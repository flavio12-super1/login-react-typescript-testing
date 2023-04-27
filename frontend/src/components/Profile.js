// import React, { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axiosInstance from "../config/axiosConfig";

// function Profile() {
//   const { username } = useParams();
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     axiosInstance
//       .get("/verify")
//       .then((response) => {
//         console.log(response.data.username);
//         setUser(response.data.username);
//       })
//       .catch((error) => {
//         console.log(error);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }, []);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   const isOwnProfile = user && user === username;

//   const ProfilePage = () => {
//     return (
//       <div>
//         <div>Profile</div>
//         <div>
//           <span>Username: </span>
//           <div>{username}</div>
//           {isOwnProfile ? (
//             <p>This is your own profile.</p>
//           ) : (
//             <p>This is someone else's profile.</p>
//           )}
//         </div>
//       </div>
//     );
//   };

//   async function getUser() {
//     await axiosInstance
//       .get("/getUser", {
//         params: {
//           email: username,
//         },
//       })
//       .then((response) => {
//         console.log(response.data.message);
//         if (response.data.message == "success") {
//           alert("found");
//           return true;
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     alert("not found");
//     return false;
//   }

//   return (
//     <div>{getUser() ? <ProfilePage /> : <div>This user does not</div>}</div>
//   );
// }

// export default Profile;
// import React, { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axiosInstance from "../config/axiosConfig";

// function Profile() {
//   const { username } = useParams();
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [userFound, setUserFound] = useState(false);

//   useEffect(() => {
//     axiosInstance
//       .get("/verify")
//       .then((response) => {
//         console.log(response.data.username);
//         setUser(response.data.username);
//       })
//       .catch((error) => {
//         console.log(error);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }, []);

//   useEffect(() => {
//     async function getUser() {
//       try {
//         const response = await axiosInstance.get("/getUser", {
//           params: {
//             email: username,
//           },
//         });
//         console.log(response.data.message);
//         if (response.data.message === "success") {
//           setUserFound(true);
//         }
//       } catch (error) {
//         setUserFound(false);
//         console.log(error);
//       }
//     }

//     getUser();
//   }, [username]);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   const isOwnProfile = user && user === username;

//   const ProfilePage = () => {
//     return (
//       <div>
//         <div>Profile</div>
//         <div>
//           <span>Username: </span>
//           <div>{username}</div>
//           {isOwnProfile ? (
//             <p>This is your own profile.</p>
//           ) : (
//             <p>This is someone else's profile.</p>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       {userFound ? <ProfilePage /> : <div>This user does not exist.</div>}
//     </div>
//   );
// }

// export default Profile;

// import React, { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axiosInstance from "../config/axiosConfig";

// function Profile() {
//   const { username } = useParams();
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     axiosInstance
//       .get("/verify")
//       .then((response) => {
//         console.log(response.data.username);
//         setUser(response.data.username);
//       })
//       .catch((error) => {
//         console.log(error);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }, []);

//   async function checkUserExists() {
//     try {
//       const response = await axiosInstance.get("/getUser", {
//         params: {
//           email: username,
//         },
//       });
//       console.log(response.data.message);
//       if (response.data.message === "success") {
//         console.log("success");
//         return true;
//       }
//       //   return response.data.message === "success";
//     } catch (error) {
//       console.log(error);
//       return false;
//     }
//   }

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   const isOwnProfile = user && user === username;

//   const ProfilePage = () => {
//     return (
//       <div>
//         <div>Profile</div>
//         <div>
//           <span>Username: </span>
//           <div>{username}</div>
//           {isOwnProfile ? (
//             <p>This is your own profile.</p>
//           ) : (
//             <p>This is someone else's profile.</p>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       {checkUserExists() == true ? (
//         <ProfilePage />
//       ) : (
//         <div>This user does not exist.</div>
//       )}
//     </div>
//   );
// }

// export default Profile;

import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";

function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function checkUserExists(user) {
    try {
      const response = await axiosInstance.get("/getUser", {
        params: {
          email: username,
        },
      });
      console.log(response.data.message);
      if (response.data.message === "success") {
        console.log("success");
        setUser(user);
        return true;
      }
    } catch (error) {
      setUser(null);
      console.log(error);
      return false;
    }
  }

  useEffect(() => {
    axiosInstance
      .get("/verify")
      .then(async (response) => {
        console.log(response.data.username);

        await checkUserExists(response.data.username);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const ProfilePage = () => {
    return (
      <div>
        <div>Profile</div>
        <div>
          <span>Username: </span>
          <div>{username}</div>
          {user && user === username ? (
            <p>This is your own profile.</p>
          ) : (
            <p>This is someone else's profile.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {user != null ? <ProfilePage /> : <div>This user does not exist</div>}
    </div>
  );
}

export default Profile;
