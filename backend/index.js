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
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);

const port = process.env.PORT || 8000;

dotenv.config();
const mongoose = require("mongoose");
const dburl = process.env.DBURL;
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
// app.use(helmet());
app.use(express.json());
// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000/"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));

var store = new MongoDBStore({
  uri: dburl,
  collection: "mySessions",
});

// Catch errors
store.on("error", function (error) {
  console.log(error);
});

app.use(
  session({
    key: "userId",
    secret: "flavioHerrera",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
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

// // Connect to MongoDB using Mongoose and create a User schema and model for storing users' information in the database:

const bcrypt = require("bcrypt");
const saltRounds = 10;

mongoose.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mdb = mongoose.connection;
mdb.on("error", (error) => console.error(error));
mdb.once("open", () => console.log("Connected to Mongoose"));

// const userSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true },
//     password: { type: String, required: true, select: true },
//     notifications: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
//   },
//   { strict: true }
// );

// userSchema.methods.isValidPassword = async function (password) {
//   try {
//     const compare = await bcrypt.compare(password, this.password);
//     return compare;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Error comparing passwords");
//   }
// };

// const User = mongoose.model("User", userSchema);
const userSchema = require("./models/userSchema");

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

const verifyJWT = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
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
  } else {
    res.send("user is not authorized");
  }
};

const verify = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.token) {
    const token = req.session.user.token;

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "authentication failed" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

//test route
app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.json({ message: "user is authenticated to make api requests" });
});

// Create login and sign up endpoints:
app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
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

      const token = jwt.sign({ id: user._id }, secret, {
        expiresIn: 60 * 60 * 24,
      });

      console.log("login was successful");

      req.session.user = { userId: user._id, token: token };

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

app.get("/getUser", verifyJWT, async (req, res) => {
  const { email } = req.query;
  console.log(email);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("user exists");
    res.status(201).json({ message: "success" });
  } else {
    console.log("user does not exist");
    res.status(409).json({ message: "error" });
  }
});

app.post("/mySearch", verifyJWT, async (req, res) => {
  const { search } = req.body;
  console.log(search);
  const existingUsers = await User.find({
    email: { $regex: new RegExp(search, "i") },
  });
  if (existingUsers.length > 0) {
    console.log(
      "users found: " + existingUsers.map((user) => user.email).join(", ")
    );
    res.status(200).json({ message: "success", users: existingUsers });
  } else {
    console.log("users not found");
    res.status(404).json({ message: "error" });
  }
});

// Routes
const testRoutes = require("./routes/test");
app.use("/test", verifyJWT, testRoutes);
// Routes
const chartRoutes = require("./routes/chart");
app.use("/chart", verifyJWT, chartRoutes);
// Routes
const uploadRoutes = require("./routes/upload-xlsx");
app.use("/upload", verifyJWT, uploadRoutes);
// Routes
const deleteRoute = require("./routes/deleteRoute");
app.use("/delete", verifyJWT, deleteRoute);
const userData = require("./routes/userData");
app.use("/userData", verifyJWT, userData);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// You can use Socket.IO to ensure real-time updates between the server and clients. Initialize Socket.IO server and configure it as middleware:

const io = require("socket.io")(server);
const Room = require("./models/Room");
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const crypto = require("crypto");

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      console.log("decoded id: " + decoded.id);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("invalid_token"));
    }
  } else {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join(socket.userId);

  console.log(`User ${socket.userId} connected`);

  socket.on("createRoom", (roomName) => {
    // console.log(`User ${socket.userId}: ` + msg);

    crypto.randomBytes(8, (err, buf) => {
      if (err) throw err;

      const roomID = buf.toString("hex");

      console.log(`${buf.length} bytes of random data: ${roomID}`);

      const room = new Room({
        roomID: roomID,
        roomName: roomName,
      });

      room
        .save()
        .then((result) => {
          console.log(result);
          socket.emit("roomID", roomID);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });

  socket.on("sendMessage", async (data) => {
    const email = data.email;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("user dosen't exist");
      // return res.status(401).json({ error: "user dosen't exist" });
    }

    // console.log("userID: " + user._id);
    console.log(data);
    console.log(data.senderEmail + " says: " + data.message);
    io.to(`${user._id}`).emit("message", data);
  });

  socket.on("sendFollowRequest", async (data) => {
    const user = await User.findOne({ email: data.user });
    if (user) {
      console.log(data);
      console.log(data.email + " made a friend request to: " + user.email);
      // console.log("user exists: " + user._id);

      crypto.randomBytes(8, (err, buf) => {
        if (err) throw err;

        const id = buf.toString("hex");

        console.log(`${buf.length} bytes of random data: ${id}`);

        User.updateOne(
          { _id: user._id },
          { $push: { notifications: { id: id, userID: data.userID } } }
        )
          .then((result) => {
            console.log(result);
            io.to(`${user._id}`).emit("friendRequest", data);
          })
          .catch((err) => {
            console.error(err);
          });
      });

      // res.status(201).json({ message: "success" });
    } else {
      console.log("user does not exist");
      // res.status(409).json({ message: "error" });
    }
  });
  socket.on("acceptRequest", async (data) => {
    const user = await User.findOne({ _id: data.id });
    if (!user) {
      console.log("User does not exist");
      return;
    }

    // Generate a random message ID
    const messageId = crypto.randomBytes(8).toString("hex");

    //this works for adding new messages, sort off
    // // create a new message
    // const messageData = {
    //   senderName: data.myEmail,
    //   recipientName: user.email,
    //   message: null,
    //   images: [],
    //   messageReferance: null, // this should be updated after the channel is created
    // };

    // const message = new Message({
    //   messageID: messageId,
    //   message: [messageData], // store message data as an array of Data objects
    // });

    const message = new Message({
      messageID: messageId,
      message: [null], // store message data as an array of Data objects
    });

    try {
      const savedMessage = await message.save();

      // Generate a random room ID
      const channelID = crypto.randomBytes(8).toString("hex");

      // Create a new channel with the message reference
      const channel = new Channel({
        channelID: channelID,
        members: [data.userID, user.email],
        messageReferanceID: savedMessage.messageID,
      });

      const savedChannel = await channel.save();

      const package = {
        user1: user._id,
        user2: data.userID,
        channelID: savedChannel.channelID,
      };
      console.log(package);
      console.log(`${data.userID} accepted ${user._id}'s friend request`);
      io.to(`${user._id}`)
        .to(socket.userId)
        .emit("friendRequestAccepted", package);
    } catch (error) {
      console.log("Error creating channel:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    socket.leaveAll();
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

app.get("/Lurker", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get("/Lurker/:page", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});
app.get("/Lurker/channel/server/", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});
app.get("/Lurker/channel/server/:channelID", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});
app.get("/Lurker/channel/messages/", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});
app.get("/Lurker/channel/messages/:channelID", verify, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("body: " + req.user);
    res.json({ message: "success", username: req.user.email });
  }
);
app.get(
  "/loginStatus",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send({ loggedIn: true, user: req.user });
  }
);

app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
