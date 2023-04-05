const express = require("express");
const passport = require("passport");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const path = require("path");
const http = require("http");
const app = express();

const server = require("http").createServer(app);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' http://localhost:8000"
  );

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  next();
});

const cookieParser = require("cookie-parser");
const session = require("express-session");

const port = process.env.PORT || 8000;

dotenv.config();

// Create a rate limiter with the desired configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: (req, res) => {
    const timeLeft = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const error = {
      message: `Too many login attempts from this IP, please try again in ${minutes} minutes and ${seconds} seconds`,
    };
    res.status(429).json({ error });
  },
});

// Use the helmet middleware
app.use(helmet());
app.use(express.json());
// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000/*"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    key: "userId",
    secret: "flavioHerrera",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
      secure: false,
    },
  })
);

app.use(passport.initialize());

// Configure the Passport strategy for JWT authentication:
const secret = process.env.SESSION_SECRET;
const jwt = require("jsonwebtoken");

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

// Connect to MongoDB using Mongoose and create a User schema and model for storing users' information in the database:

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dburl = process.env.DBURL;

mongoose.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mdb = mongoose.connection;
mdb.on("error", (error) => console.error(error));
mdb.once("open", () => console.log("Connected to Mongoose"));

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true, select: true },
  },
  { strict: true }
);

userSchema.methods.isValidPassword = async function (password) {
  try {
    const compare = await bcrypt.compare(password, this.password);
    return compare;
  } catch (error) {
    console.error(error);
    throw new Error("Error comparing passwords");
  }
};

const User = mongoose.model("User", userSchema);

//validate email:
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
//validate password:
const validatePassword = (password) => {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/.test(password);
};
app.get("/loginStatus", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("token not found");
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "authentication failed" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

// const verify = (req, res, next) => {
//   console.log(req.headers);
//   passport.authenticate("jwt", { session: false }, (err, user, info) => {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     // Store the user object in the request object for later use
//     req.user = user;
//     // Call the next middleware
//     return next();
//   })(req, res, next);
// };

// const verify = (req, res, next) => {
//   // Get the token from the Authorization header
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "missing token" });
//   }

//   try {
//     // Verify the token using your secret key
//     const decoded = jwt.verify(token, secret);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };

// const verify = (req, res, next) => {
//   if (req.session) {
//     const token = JSON.stringify(req.session.user.token);
//     console.log(JSON.stringify(req.session.user.token));

//     jwt.verify(token, secret, (err, decoded) => {
//       if (err) {
//         res.json({ auth: false, message: "authentication failed" });
//       } else {
//         req.userId = decoded.id;
//         next();
//       }
//     });
//   }

//   console.log("auth denied");
// };
const verify = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.token) {
    const token = req.session.user.token;
    console.log(token);

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "authentication failed" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  } else {
    return res.redirect("http://localhost:8000/login");
  }
};

// app.get(
//   "/verify",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     console.log("body: " + req.user);
//     res.json({ message: "success" });
//   }
// );

//test route
app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send("user is authenticated to make api requests");
});

// Create login and sign up endpoints:
app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.headers);
    if (!(validateEmail(email) && validatePassword(password))) {
      console.log("invalid or empty fields");
      res.status(401).json({ error: "invalid or empty fields" });
    } else {
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Invalid email or username does not exist");
        return res
          .status(401)
          .json({ error: "Invalid email or username does not exist" });
      }

      const isValidPassword = await user.isValidPassword(password);

      if (!isValidPassword) {
        console.log("invalid password or incorect password");
        return res
          .status(401)
          .json({ error: "invalid password or incorect password" });
      }

      // const token = jwt.sign({ id: user._id }, secret, {
      //   expiresIn: 60 * 60 * 24,
      // });
      // console.log("login was successful");
      // req.session.user = user;
      // console.log(req.session.user);
      // res.json({ token, error: null, user });
      const token = jwt.sign({ id: user._id }, secret, {
        expiresIn: 60 * 60 * 24,
      });

      console.log("login was successful");

      req.session.user = { userId: user._id, token: token };

      console.log(req.session.user);

      res.json({ token, error: null, user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/signup", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!(validateEmail(email) && validatePassword(password))) {
      console.log("invalid or empty fields");
      res.status(401).json({ error: "invalid or empty fields" });
    } else {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User with this email already exists");
        res.status(409).json({ error: "User with this email already exists" });
      } else {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User created" });
      }
    }
  } catch (error) {
    // Handle the error appropriately
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Routes
const testRoutes = require("./routes/test");
app.use("/test", testRoutes);
// Routes
const chartRoutes = require("./routes/chart");
app.use("/chart", chartRoutes);
// Routes
const uploadRoutes = require("./routes/upload-xlsx");
app.use("/upload", uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// You can use Socket.IO to ensure real-time updates between the server and clients. Initialize Socket.IO server and configure it as middleware:

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Static files
app.use(express.static(path.resolve(__dirname, "../frontend/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get("/dashboard", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("body: " + req.user);
    res.json({ message: "success" });
  }
);

// // Define the logout route
// app.post("/logout", (req, res) => {
//   // Invalidate the token on the server-side
//   const token = req.headers.authorization.split(" ")[1];
//   jwt.verify(token, secret, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     // Calculate the remaining time until token expiration
//     const expirationTime = 60000 * 5;
//     // Set the token expiration time to an earlier time to invalidate it
//     const expiresIn = expirationTime;
//     const newToken = jwt.sign({ id: decoded.id }, secret, {
//       expiresIn,
//     });
//     return res.json({ message: "Logout successful", token: newToken });
//   });
// });
// app.post("/logout", (req, res) => {
//   // Invalidate the token on the server-side
//   // const token = req.headers.authorization.split(" ")[1];
//   // jwt.verify(token, secret, (err, decoded) => {
//   //   if (err) {
//   //     return res.status(401).json({ message: "Unauthorized" });
//   //   }
//   //   // Destroy the session
//   //   return res.json({ message: "Logout successful" });
//   // });
//   // res.clearCookie("userId");
//   // res.end();

//   // req.session.destroy(function (err) {
//   //   if (err) {
//   //     console.log(err);
//   //   } else {
//   //     res.clearCookie("session");
//   //     res.redirect("/");
//   //   }
//   // });
// });

// app.set("trust proxy", (ip) => {
//   if (ip === "127.0.0.1" || ip === "123.123.123.123")
//     return true; // trusted IPs
//   else return false;
// });

app.post("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      return res.redirect("http://localhost:8000/login");
    }
  });
});

//arcgis
const fs = require("fs");
const Papa = require("papaparse");

function generateFinalCsvFile(csvDataLibraryRooms, csvDataUnitsNames) {
  return new Promise((resolve) => {
    for (let i = 0; i < csvDataLibraryRooms.length; i++) {
      let objectId = csvDataLibraryRooms[i].GUID;
      let objectName = "";

      for (let j = 0; j < csvDataUnitsNames.length; j++) {
        if (csvDataUnitsNames[j].id == objectId) {
          objectName = csvDataUnitsNames[j].name.substring(0, 3);
          csvDataLibraryRooms[i].Name = objectName; //set the name of the room

          const timestamp = csvDataLibraryRooms[i].CreationDate; // timestamp from CSV file
          const dateObj = new Date(`${timestamp} GMT-0000`);
          const options = { timeZone: "America/Los_Angeles" }; // specify timezone as options
          const localTime = dateObj.toLocaleString("en-US", options); // convert the timestamp to local time
          csvDataLibraryRooms[i].CreationDate = localTime;

          const timestamp2 = csvDataLibraryRooms[i].EditDate; // timestamp from CSV file
          const dateObj2 = new Date(`${timestamp2} GMT-0000`);
          const options2 = { timeZone: "America/Los_Angeles" }; // specify timezone as options
          const localTime2 = dateObj2.toLocaleString("en-US", options2); // convert the timestamp to local time
          csvDataLibraryRooms[i].EditDate = localTime2;
          delete csvDataLibraryRooms[i].headCount;
        }
      }
    }

    resolve(csvDataLibraryRooms);
  });
}

function parseCsvDataLibraryRooms(csvDataUnitsNames) {
  const csvFilePath = "./libraryRooms_13.csv";

  const file = fs.createReadStream(csvFilePath);
  var csvDataLibraryRooms = [];

  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      step: function (result) {
        csvDataLibraryRooms.push(result.data);
      },
      complete: function (results, file) {
        generateFinalCsvFile(csvDataLibraryRooms, csvDataUnitsNames).then(
          (result) => {
            resolve(result);
          }
        );
      },
    });
  });
}

function parseCsvDataUnits() {
  const csvFilePath = "./Units_2.csv";
  const file = fs.createReadStream(csvFilePath);

  return new Promise((resolve) => {
    var csvDataUnitsNames = [];

    Papa.parse(file, {
      header: true,
      step: function (result) {
        csvDataUnitsNames.push({
          name: result.data.Name,
          id: result.data.GlobalID,
        });
      },
      complete: function (results, file) {
        parseCsvDataLibraryRooms(csvDataUnitsNames).then((result) => {
          resolve(result);
        });
      },
    });
  });
}

app.get("/chart", (req, res) => {
  parseCsvDataUnits().then((result) => {
    // console.log(result);
    res.send(result);
  });
});
//end of chartjs

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const redis = require("redis");

const client = redis.createClient({
  host: "localhost",

  port: 6379,
});

client.on("error", (err) => {
  console.error(err);
});
