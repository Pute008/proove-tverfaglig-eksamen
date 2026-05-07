// require('dotenv').config
const express = require("express");
const session = require("express-session");
const app = express();

const Database = require("better-sqlite3");
const db = new Database("skole.db");

const cors = require("cors");
app.use(cors());

const bcrypt = require("bcrypt");

app.use(express.static("public"));

app.use(express.json());

const port = 3000

app.use(
    session({
        // secret: process.env.SESSION_SECRET,
        secret: "hemmeligNøkkel",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);

function kreverInnlogging(req, res, next) {
    if(!req.session.users) {
        return res.redirect('/index.html');
    }
    next();
}

function kreverAdmin(req, res, next) {
    if(req.session.users.role !== 3) {  // 3 is the admin role_id
        console.warn("You have no access")
        return res.redirect('/home.html');
    }
    next();
}

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const users = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!users) {
        return res.status(401).json({ message: "Wrong email or password" });
    }

    const passordErGyldig = await bcrypt.compare(password, users.password);
    if (!passordErGyldig) {
        return res.status(401).json({ message: "Wrong email or password"})
    }

    req.session.users = { id: users.id, firstname: users.firstname, lastname: users.lastname, role: users.role_id };
    res.json({ message: "Login successful", redirect: "home.html" })
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ message: "You are logged out" });
})

app.post("/newUser", async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)");
    // oppsummerer operasjonen som har blitt utført
    const info = stmt.run(firstname, lastname, email, hashPassword);
    res.json({ message: "New users created", info })
});

app.post("/adminNewUser", kreverAdmin, async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const stmt = db.prepare("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)");
        const info = stmt.run(firstname, lastname, email, hashPassword);
        res.json({ message: "New users created", info });
    } catch (error) {
        console.error("adminNewUser error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/userInfo', kreverInnlogging, (req, res) => {
    const userID = req.session.users.id;
    try {
        const user = db.prepare(`
            SELECT 
                classes.name AS class_name, 
                users.*, 
                roles.name AS role_name
            FROM users
            LEFT JOIN classes ON classes.id = users.classes_id
            LEFT JOIN roles ON users.role_id = roles.id
            WHERE users.id = ?
        `).get(userID);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("userInfo error:", error);
        res.status(500).json({ error: "Server error" });
    }
})

app.get('/info', kreverInnlogging, (req, res) => {
    res.sendFile(__dirname + "/hidden/info.html");
})

app.get('/addPerson', kreverAdmin, (req, res) => {
    res.sendFile(__dirname + "/hidden/addPerson.html");
})

// kaller på js filen
app.get('/addPerson.js', kreverAdmin, (req, res) => {
    res.sendFile(__dirname + "/hidden/addPerson.js");
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});