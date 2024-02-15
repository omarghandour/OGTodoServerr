const PORT = process.env.PORT ?? 5000;
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const app = express();
const pool = require("./db");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const functions = require("firebase-functions");
//get todos
app.use(cors({ origin: true }));
app.use(express.json());
app.get("/todos/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const todos = await pool.query(
      "SELECT * FROM todos WHERE user_email = $1",
      [userEmail]
    );

    res.json(todos.rows);
  } catch (err) {
    console.log(error);
  }
});
app.get("/todos/:userEmail/today", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const streak = await pool.query("SELECT * FROM users WHERE email = $1", [
      userEmail,
    ]);
    const rows = streak.rows[0];
    res.json(rows);
  } catch (err) {
    console.log(err);
  }
});
// app.get("/todos/tryhard/:userEmail", async (req, res) => {
//   const { userEmail } = req.params;
//   try {
//     const todos = await pool.query(
//       "SELECT * FROM tryhard WHERE user_email = $1",
//       [userEmail]
//     );

//     res.json(todos.rows);
//   } catch (err) {
//     console.log(error);
//   }
// });
// Create a new todo
app.post("/todos/tryhard", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  console.log(user_email, title, progress, date);
  const id = uuidv4();
  try {
    const newTodo = await pool.query(
      `INSERT INTO tryhard(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`,
      [id, user_email, title, progress, date]
    );
    res.json(newTodo);
  } catch (err) {
    console.log(err);
  }
});
app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  //   console.log(user_email, title, progress, date);
  const id = uuidv4();
  const today1 = await new Date().toLocaleString("en-US", {
    day: "numeric",
  });
  const todayDay = +today1;
  if (todayDay !== null) {
    try {
      console.log(today1);
      const newTodo = await pool.query(
        `INSERT INTO todos (id, user_email, title, progress, date, todayy) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [id, user_email, title, progress, date, todayDay]
      );
      res.json(newTodo);
    } catch (err) {
      console.log(err);
    }
  }
});
// edit todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date, today } = req.body;
  try {
    const editTodo = await pool.query(
      "UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4, todayy = $6 WHERE id = $5;",
      [user_email, title, progress, date, id, today]
    );
    res.json(editTodo);
  } catch (err) {
    console.log(err);
  }
});
// delete todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTodo = await pool.query("DELETE FROM todos WHERE id = $1;", [
      id,
    ]);
    res.json(deleteTodo);
  } catch (err) {
    console.log(err);
  }
});
// signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  try {
    const signUp = await pool.query(
      `INSERT INTO users (email, hashed_password) VALUES($1, $2)`,
      [email, hashedPassword]
    );
    const token = jwt.sign({ email }, "secret", {});
    res.json({ email, token });
  } catch (err) {
    console.log(err);
    if (err) {
      res.json({ detail: err.detail });
    }
  }
});
// today
app.patch("/today", async (req, res) => {
  const { email, today } = req.body;

  try {
    // Check if the email exists in your table
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!users.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the third column to 5 for the user with the specified email
    const updateUserQuery = "UPDATE users SET today = $1 WHERE email = $2";
    await pool.query(updateUserQuery, [today, email]);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
// login
app.patch("/login", async (req, res) => {
  const { email, streak } = req.body;

  try {
    // Check if the email exists in your table
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!users.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the third column to 5 for the user with the specified email
    const updateUserQuery = "UPDATE users SET streak = $1 WHERE email = $2";
    await pool.query(updateUserQuery, [streak, email]);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!users.rows.length)
      return res.json({
        detail: "User does not exist : انتو هتضحكو عليا انا  ",
      });
    const success = await bcrypt.compare(
      password,
      users.rows[0].hashed_password
    );
    const token = jwt.sign({ email }, "secret", { expiresIn: "100hr" });

    if (success) {
      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed :(" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

exports.api = functions.https.onRequest(app);
