const express = require("express");
const passport = require("passport");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 8000;

dotenv.config();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
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
const dburl = process.env.DBURL;

mongoose.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mdb = mongoose.connection;
mdb.on("error", (error) => console.error(error));
mdb.once("open", () => console.log("Connected to Mongoose"));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.methods.isValidPassword = async function (password) {
  const compare = await bcrypt.compare(password, this.password);
  return compare;
};

const User = mongoose.model("User", userSchema);

// Create login and sign up endpoints:
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isValidPassword = await user.isValidPassword(password);

  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, secret);
  res.json({ token });
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });

  await user.save();
  res.send("User created");
});

// Routes
const testRoutes = require("./routes/test");
app.use("/test", testRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// You can use Socket.IO to ensure real-time updates between the server and clients. Initialize Socket.IO server and configure it as middleware:

const server = require("http").createServer(app);

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

app.get(
  "/dashboard",

  (req, res) => {
    console.log(req.user);
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  }
);

app.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "success" });
  }
);

// Define the logout route
app.post("/logout", (req, res) => {
  // Invalidate the token on the server-side
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Calculate the remaining time until token expiration
    const expirationTime = 60000 * 5;
    // Set the token expiration time to an earlier time to invalidate it
    const expiresIn = expirationTime;
    const newToken = jwt.sign({ id: decoded.id }, secret, {
      expiresIn,
    });
    return res.json({ message: "Logout successful", token: newToken });
  });
});

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
