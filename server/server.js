
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("Set a secure JWT_SECRET in your .env file");
}

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173"
  ]
}));
app.use(express.json());

const DATA_FILE = new URL("./Data/students.json", import.meta.url);

// Read registered students.
async function getStudents() {
  const data = await readFile(DATA_FILE, "utf8");
  return JSON.parse(data);
}

// Save registered students.
async function saveStudents(students) {
  await writeFile(
    DATA_FILE,
    JSON.stringify(students, null, 2)
  );
}

// Test the server.
app.get("/", (req, res) => {
  res.json({
    message: "Student Registration API is running"
  });
});

// Register a student.
app.post("/api/register", async (req, res) => {
  try {
    const {
      name, email, contact, gender,
      password, confirmPassword
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof contact !== "string" ||
      typeof gender !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[0-9+()\s-]{7,20}$/.test(contact) ||
      !["Male", "Female", "Other", "Prefer not to say"].includes(gender) ||
      password.length < 8 ||
      password !== confirmPassword
    ) {
      return res.status(400).json({
        message: "Invalid registration details"
      });
    }

    const students = await getStudents();
    const normalizedEmail = email.trim().toLowerCase();

    if (students.some(s => s.email === normalizedEmail)) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const student = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      contact: contact.trim(),
      gender,
      passwordHash: await bcrypt.hash(password, 12)
    };

    students.push(student);
    await saveStudents(students);

    res.status(201).json({
      message: "Student registered successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// Student login.
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" ||
        typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const students = await getStudents();
    const student = students.find(
      s => s.email === email.trim().toLowerCase()
    );

    const valid = student
      ? await bcrypt.compare(password, student.passwordHash)
      : false;

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

// Protected student profile.
app.get("/api/profile", (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  try {
    req.user = jwt.verify(
      authorization.slice(7),
      JWT_SECRET
    );
    next();
  } catch {
    res.status(403).json({
      message: "Invalid or expired token"
    });
  }
}, async (req, res) => {
  try {
    const students = await getStudents();
    const student = students.find(s => s.id === req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      contact: student.contact,
      gender: student.gender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to load profile"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
