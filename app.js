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

// function kreverITRolle(req, res, next) {
//     if(req.session.users.role !== 5) {
//         console.warn("You have no access")
//         return res.redirect('/home.html');
//     }
//     next();
// }

function kreverAdminOrIT(req, res, next) {
    if(req.session.users.role !== 3 && req.session.users.role !== 5) {  // 3 = admin, 5 = IT
        console.warn("You have no access")
        return res.redirect('/home.html');
    }
    next();
}

// spørringer for å poste informasjon
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

app.post("/newLesson", kreverAdmin, async (req, res) => {
    try {
        const { teacher, rooms, classes, subject, start_time, end_time } = req.body;
        const stmt = db.prepare("INSERT INTO lessons (teacher_id, room_id, classes_id, subject_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)");
        const info = stmt.run(teacher, rooms, classes, subject, start_time, end_time);
        console.log(info)
        res.json({ message: "New lesson created", info });
    } catch (error) {
        console.error("newLesson error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/adminNewUser", kreverAdmin, async (req, res) => {
    try {
        const { firstname, lastname, email, password, role, classes } = req.body;
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const stmt = db.prepare("INSERT INTO users (firstname, lastname, email, password, role_id, classes_id) VALUES (?, ?, ?, ?, ?, ?)");
        const info = stmt.run(firstname, lastname, email, hashPassword, role, classes);
        res.json({ message: "New users created", info });
    } catch (error) {
        console.error("adminNewUser error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Spørringer for å hente informasjon
app.get('/getSubjects', kreverAdmin, (req, res) => {
    try {
        const subjects = db.prepare("SELECT id, name FROM subjects").all();
        res.json(subjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getTeachers', kreverAdmin, (req, res) => {
    try {
        const teachers = db.prepare("SELECT id, firstname, lastname FROM users WHERE role_id = 2").all();
        res.json(teachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getClasses', kreverAdmin, (req, res) => {
    try {
        const classes = db.prepare("SELECT id, name FROM classes").all();
        res.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getRooms', kreverAdmin, (req, res) => {
    try {
        const rooms = db.prepare("SELECT id, name FROM rooms").all();
        res.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getRoles', kreverAdmin, (req, res) => {
    try {
        const roles = db.prepare("SELECT id, name FROM roles").all();
        res.json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getComputers', kreverAdmin, (req, res) => {
    try {
        const roles = db.prepare(`SELECT computer.id, computer.service_tag, computer.modell, computer_modell.id, computer_modell.modell_name
            FROM computer
            INNER JOIN computer_modell
            ON computer.modell = computer_modell.id`).all();
        res.json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: error.message });
    }
});

// spørringer for å vise informasjon
app.get('/showYourLessons', kreverInnlogging, (req, res) => {
    try {
        const userID = req.session.users.id;
        const userRole = req.session.users.role;
        let allActivities;

        if (userRole === 3) {
            // Admin - show all lessons
            allActivities = db.prepare(`SELECT 
                lessons.start_time, lessons.end_time,
                rooms.name AS room_name,
                subjects.name AS subject_name,
                users.firstname,
                users.lastname,
                classes.name AS class_name
                FROM lessons
                INNER JOIN rooms ON lessons.room_id = rooms.id
                INNER JOIN subjects ON lessons.subject_id = subjects.id
                INNER JOIN users ON lessons.teacher_id = users.id
                INNER JOIN classes ON lessons.classes_id = classes.id
                ORDER BY lessons.start_time`).all();
        } else if (userRole === 2) {
            // Teacher - show lessons where teacher_id matches
            allActivities = db.prepare(`SELECT 
                lessons.start_time, lessons.end_time,
                rooms.name AS room_name,
                subjects.name AS subject_name,
                users.firstname,
                users.lastname,
                classes.name AS class_name
                FROM lessons
                INNER JOIN rooms ON lessons.room_id = rooms.id
                INNER JOIN subjects ON lessons.subject_id = subjects.id
                INNER JOIN users ON lessons.teacher_id = users.id
                INNER JOIN classes ON lessons.classes_id = classes.id
                WHERE lessons.teacher_id = ?
                ORDER BY lessons.start_time`).all(userID);
        } else if (userRole === 1) {
            // Student - show lessons for their class
            const user = db.prepare("SELECT classes_id FROM users WHERE id = ?").get(userID);
            if (!user || !user.classes_id) {
                return res.json([]);
            }
            allActivities = db.prepare(`SELECT 
                lessons.start_time, lessons.end_time,
                rooms.name AS room_name,
                subjects.name AS subject_name,
                users.firstname,
                users.lastname,
                classes.name AS class_name
                FROM lessons
                INNER JOIN rooms ON lessons.room_id = rooms.id
                INNER JOIN subjects ON lessons.subject_id = subjects.id
                INNER JOIN users ON lessons.teacher_id = users.id
                INNER JOIN classes ON lessons.classes_id = classes.id
                WHERE lessons.classes_id = ?
                ORDER BY lessons.start_time`).all(user.classes_id);
        } else {
            // hvis du ikke har en rolle, vil ingen ting vises, den sender et tomt json format
            return res.json([]);
        }

        console.log(allActivities)
        res.json(allActivities);
    } catch (error) {
        console.error("Error after catching activities:", error);
        res.status(500).json({ message: "Could not get activities", error: error.message });
    }
})

app.get('/showIT-Info', kreverAdminOrIT, (req, res) => {
    try {
        const users = db.prepare(`
            SELECT 
                classes.name AS class_name, 
                users.firstname, users.lastname,
                roles.name AS role_name,
                computer_modell.modell_name,
                computer.service_tag,
                users.id
            FROM users
            LEFT JOIN classes ON classes.id = users.classes_id
            LEFT JOIN roles ON users.role_id = roles.id
            LEFT JOIN computer ON computer.users_id = users.id
            LEFT JOIN computer_modell ON computer.modell = computer_modell.id;
        `).all();

        if (!users) {
            return res.status(404).json({ error: "No users found" });
        }
        res.json(users);
    } catch (error) {
        console.error("showIT-Info error:", error);
        res.status(500).json({ error: "Server error" });
    }
})

app.get('/userInfo', kreverInnlogging, (req, res) => {
    const userID = req.session.users.id;
    try {
        const user = db.prepare(`
            SELECT 
                classes.name AS class_name, 
                users.*, 
                roles.name AS role_name,
                computer_modell.modell_name,
                computer.service_tag
            FROM users
            LEFT JOIN classes ON classes.id = users.classes_id
            LEFT JOIN roles ON users.role_id = roles.id
            LEFT JOIN computer ON computer.users_id = users.id
            LEFT JOIN computer_modell ON computer.modell = computer_modell.id
            WHERE users.id = ?;
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

// ruter som sender deg til hidden folderen
app.get('/addPerson', kreverAdmin, (req, res) => {
    res.sendFile(__dirname + "/hidden/addPerson.html");
})

app.get('/addLesson', kreverAdmin, (req, res) => {
    res.sendFile(__dirname + "/hidden/addLesson.html");
})

app.get('/userComputerInfo', kreverAdminOrIT, (req, res) => {
    res.sendFile(__dirname + "/hidden/userComputerInfo.html");
})

// ruter som bruker js fra hidden
app.get('/addPerson.js', kreverAdmin, (req, res) => {
    res.sendFile(__dirname + "/hidden/addPerson.js");
})

app.get('/addLesson.js', kreverAdmin, (req, res) => {
    res.sendFile(__dirname + "/hidden/addLesson.js");
})

app.get('/userComputerInfo.js', kreverAdminOrIT, (req, res) => {
    res.sendFile(__dirname + "/hidden/userComputerInfo.js");
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});