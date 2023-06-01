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

const sessionMiddleware = session({
  key: "userId",
  secret: "flavioHerrera",
  resave: false,
  saveUninitialized: false,
  store: store,
  channelList: [],
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
  },
});

app.use(sessionMiddleware);

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

const checkRoomAccess = async (req, res, next) => {
  const { channelID } = req.params;
  console.log("roomID: " + channelID);
  const channel = await Channel.findOne({ channelID: channelID });
  if (channel) {
    console.log("channel exists");
    console.log(req.userId);
    console.log(channel.members);
    if (channel.members.includes(req.userId)) {
      console.log("user is authorized to access this room");
      next();
    } else {
      // res.json({ message: "user is not authorized to access this room" });
      res.redirect("/lurker");
    }
  } else {
    // res.json({ message: "channel does not exist" });
    res.redirect("/lurker");
  }
  console.log("channel: " + channel);
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

      req.session.user = {
        userId: user._id,
        token: token,
        userName: user.email,
        channelList: [],
      };

      res.json({ token, error: null, user });
      console.log("login was successful");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// app.post("/signup", loginLimiter, async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     if (!(validateEmail(email) && validatePassword(password))) {
//       console.log("invalid or empty fields");
//       res.status(401).json({ error: "invalid or empty fields" });
//     } else {
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         console.log("User with this email already exists");
//         res.status(409).json({ error: "User with this email already exists" });
//       } else {
//         const hashedPassword = await bcrypt.hash(password, saltRounds);
//         const user = new User({ email, password: hashedPassword });
//         await user.save();
//         res.status(201).json({ message: "User created" });
//       }
//     }
//   } catch (error) {
//     // Handle the error appropriately
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
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

        const defaultTheme = {
          bc: { r: 28, g: 24, b: 38, a: 1 },
          fg: { r: 42, g: 39, b: 62, a: 1 },
          bannerURL:
            "https://www.primemotorz.com/wp-content/uploads/2019/08/secondary-banner-placeholder.jpg",
          bannerArray: [
            "https://www.primemotorz.com/wp-content/uploads/2019/08/secondary-banner-placeholder.jpg",
          ],
          imageURL:
            "https://i.pinimg.com/originals/d4/e0/13/d4e01341b8f4bdc193671689aaec2bbb.jpg",
          imageURLArray: [
            "https://i.pinimg.com/originals/d4/e0/13/d4e01341b8f4bdc193671689aaec2bbb.jpg",
            "https://i.kym-cdn.com/entries/icons/facebook/000/035/767/cover4.jpg",
            "https://i.ytimg.com/vi/UiCPytVT4bo/maxresdefault.jpg",
            "https://yt3.googleusercontent.com/JVTJHpdwc5AR6ntZu96w-K0M44uLx93RUnUfSFaSMb-BL6cyw4T6ipXJOIpKNbBUQV0fdju7=s900-c-k-c0x00ffffff-no-rj",
          ],
          borderColor: { r: 28, g: 24, b: 38, a: 1 },
          uc: { r: 127, g: 255, b: 250, a: 1 },
        };

        const user = new User({
          email,
          password: hashedPassword,
          theme: defaultTheme,
        });
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
    res.status(201).json({ message: "success", theme: existingUser.theme });
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

//for file uploads
const multer = require("multer");
const storage = multer.memoryStorage();
const { uploadFile, getObjectSignedUrl } = require("./s3");
const upload = multer({ storage: storage });

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

upload.single("image");
const sharp = require("sharp");

app.post("/api/posts", upload.single("image"), async (req, res) => {
  const file = req.file;

  // Check if the file is a Blob URL
  const isBlobURL = file.mimetype === "application/octet-stream";

  let fileBuffer;
  if (isBlobURL) {
    // If the file is a Blob URL, read the file data from the Blob object
    fileBuffer = file.buffer;
  } else {
    // If the file is a regular file, perform resizing and convert to buffer
    fileBuffer = await sharp(file.buffer)
      .resize({ width: 1080, fit: "contain" })
      .toBuffer();
  }

  const imageName = generateFileName();
  await uploadFile(fileBuffer, imageName, file.mimetype);

  let imageUrl = await getObjectSignedUrl(imageName);
  console.log(imageUrl);
  res.send(imageUrl);
});

// You can use Socket.IO to ensure real-time updates between the server and clients. Initialize Socket.IO server and configure it as middleware:

const io = require("socket.io")(server);
const Room = require("./models/Room");
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const crypto = require("crypto");

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // const session = socket.request.session;
  // console.log(session);
  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      console.log("decoded id: " + decoded.id);
      socket.userId = decoded.id;
      // socket.session = socket.request.session;
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
  const session = socket.request.session;
  // console.log(session.user);

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

  socket.on("message", async (data) => {
    console.log(session.user.userName);
    console.log(data.message);
    const dataObject = {
      username: session.user.userName,
      images: data.images,
      message: data.message,
    };
    console.log(dataObject);
    io.sockets.in(data.channelID).emit("message", dataObject);
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

  socket.on("acceptRequest", async (data) => {
    const user = await User.findOne({ _id: data.userID });
    if (!user) {
      console.log("User does not exist");
      return;
    }

    // Generate a random message ID
    const messageId = crypto.randomBytes(8).toString("hex");

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
        members: [socket.userId, user._id],
        messageReferanceID: savedMessage.messageID,
      });

      const savedChannel = await channel.save();

      const package = {
        user1: socket.userId,
        user2: user._id,
        channelID: savedChannel.channelID,
      };
      console.log(package);

      console.log(`${socket.userId} accepted ${user._id}'s friend request`);

      User.updateOne(
        { _id: user._id },
        {
          $push: {
            friendList: {
              userID: socket.userId,
              channelID: savedChannel.channelID,
            },
          },
        }
      )
        .then((result) => {
          // const packageData = {
          //   userID: socket.userId,
          //   email: session.user.userName,
          //   channelID: savedChannel.channelID,
          // };
          const packageData = {
            userID: user._id,
            email: user.email,
            channelID: savedChannel.channelID,
          };
          console.log(packageData);

          io.to(socket.userId).emit("friendRequestAccepted", packageData);
          console.log(result);
        })
        .catch((err) => {
          console.error(err);
        });

      User.updateOne(
        { _id: socket.userId },
        {
          $push: {
            friendList: {
              userID: user._id,
              channelID: savedChannel.channelID,
            },
          },
        }
      )
        .then((result) => {
          const packageData = {
            userID: socket.userId,
            email: session.user.userName,
            channelID: savedChannel.channelID,
          };
          console.log(packageData);

          io.to(`${user._id}`).emit("friendRequestAccepted", packageData);
          console.log(result);
          console.log(result);
        })
        .catch((err) => {
          console.error(err);
        });

      // io.to(`${user._id}`)
      //   .to(socket.userId)
      //   .emit("friendRequestAccepted", package);
    } catch (error) {
      console.log("Error creating channel:", error);
    }
  });

  socket.on("addChannel", async (data) => {
    console.log("addChannel: " + data);
    session.user.channelList.push(data);
    session.save();
  });

  socket.on("denyFriendRequest", async (data) => {
    const user = await User.findOne({ _id: socket.userId });
    if (!user) {
      console.log("User does not exist");
      return;
    }

    // User.updateOne(
    //   { _id: socket.userId },
    //   {
    //     $pull: {
    //       notifications: data.id,
    //     },
    //   },
    //   function (err, result) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(result);
    //     }
    //   }
    // );

    User.updateOne(
      { _id: socket.userId },
      { $pull: { notifications: { id: data.id } } }
    )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });

    console.log("notification removed: " + data.id);
  });

  socket.on("joinRoom", (room) => {
    //use socket.userID to check if user has access to room.room

    socket.join(room);

    console.log("joined => " + room);
  });

  socket.on("leaveRoom", (currentRoom, callback) => {
    // Perform necessary operations to leave the current room
    socket.leave(currentRoom);
    // Acknowledge the event and call the callback function
    callback();
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
app.get(
  "/Lurker/channel/messages/:channelID",
  verify,
  checkRoomAccess,
  (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  }
);

// Routes
// Set io to app
app.set("io", io);
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
const saveEdites = require("./routes/saveEdites");
app.use("/saveEdits", verifyJWT, saveEdites);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.post("/getMessages", async (req, res) => {
  const { roomID } = req.body;
  console.log(roomID);
  res.json("messages");
});

// //saving user profile themes
// app.post("/saveEdits", verifyJWT, async (req, res) => {
//   const { selectedTheme, selectedImage } = req.body; // Assuming the selected theme is sent from the frontend
//   console.log(selectedTheme);
//   console.log(selectedTheme.bc);

//   // Update the profileTheme array in the session
//   req.session.profileTheme = req.session.profileTheme || []; // Initialize the array if it doesn't exist
//   req.session.profileTheme.push(selectedTheme);
//   const userId = req.userId; // Assuming you have the user's ID in the session
//   try {
//     // Update the user's document in the database with the selected theme

//     console.log(userId);

//     const user = await User.findOne({ _id: userId });
//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     // Update the theme field in the user's document
//     user.theme = {};
//     user.theme.bc = selectedTheme.bc;
//     user.theme.imageURL = selectedImage;

//     // Save the updated user document
//     await user.save();
//     res.json({ bc: selectedTheme });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error saving user");
//   }
// });

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

const Redis = require("ioredis");
const redis = new Redis();

async function main() {
  // set an array in Redis
  await redis.lpush("myArray", "element1");

  // get the array from Redis
  const myArray = await redis.lrange("myArray", 0, -1);
  console.log(myArray); // ["element3", "element2", "element1"]
}

main().catch(console.error);

// const redis = require("redis");
// const client = redis.createClient();

// client.on("error", function (error) {
//   console.error(error);
// });

// client.set("key", "value", redis.print);
// client.get("key", redis.print);
// const redis = require("redis");
// const client = redis.createClient();

// client.on("error", (err) => {
//   console.error(err);
// });

// client.set("myArr", JSON.stringify([1, 2, 3]), (err) => {
//   if (err) throw err;
//   console.log("Array set successfully!");
// });

// client.get("myArr", (err, reply) => {
//   if (err) throw err;
//   console.log("Retrieved array:", JSON.parse(reply));
// });

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
