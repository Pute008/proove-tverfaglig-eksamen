async function logout() {
    const response = await fetch("/logout", {
        method: "POST"
    });

    if (response.ok) {
        alert("You are logged out.");
        window.location.href = "/";
    } else {
        alert("Something went wrong");
    }
}

async function loadTeachers() {
    try {
        const response = await fetch("/getTeachers");
        if (!response.ok) throw new Error("Could not load teachers");
        const teachers = await response.json();
        const select = document.getElementById("teacher");
        teachers.forEach(teacher => {
            const option = document.createElement("option");
            option.value = teacher.id;
            option.textContent = `${teacher.firstname} ${teacher.lastname}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading teachers:", error);
    }
}

async function loadClasses() {
    try {
        const response = await fetch("/getClasses");
        if (!response.ok) throw new Error("Could not load classes");
        const classes = await response.json();
        const select = document.getElementById("classes");
        classes.forEach(classItem => {
            const option = document.createElement("option");
            option.value = classItem.id;
            option.textContent = classItem.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading classes:", error);
    }
}

async function loadRooms() {
    try {
        const response = await fetch("/getRooms");
        if (!response.ok) throw new Error("Could not load rooms");
        const rooms = await response.json();
        const select = document.getElementById("rooms");
        rooms.forEach(room => {
            const option = document.createElement("option");
            option.value = room.id;
            option.textContent = room.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading rooms:", error);
    }
}

async function loadSubjects() {
    try {
        const response = await fetch("/getSubjects");
        if (!response.ok) throw new Error("Could not load subjects");
        const subjects = await response.json();
        const select = document.getElementById("subject");
        subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading subjects:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTeachers();
    loadClasses();
    loadRooms();
    loadSubjects();

    document.getElementById("newUserForm").addEventListener("submit", async function addLesson(event) {
        event.preventDefault();

        const teacher = document.getElementById("teacher").value;
        const rooms = document.getElementById("rooms").value;
        const subject = document.getElementById("subject").value;
        const classes = document.getElementById("classes").value;
        const start_time = document.getElementById("start_time").value;
        const end_time = document.getElementById("end_time").value;

        try {
            const response = await fetch("/newLesson", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    teacher,
                    rooms,
                    subject,
                    classes,
                    start_time,
                    end_time
                })
                
            });

            const result = await response.json();
            if (!response.ok) {
                alert("Error: " + (result.error || result.message));
            } else {
                alert(result.message);
                document.getElementById("newUserForm").reset();
            }
        } catch (error) {
            alert("Error creating lesson: " + error.message);
        }
    });
});