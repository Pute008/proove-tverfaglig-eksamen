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

document.addEventListener("DOMContentLoaded", () => {
    loadTeachers();
    loadClasses();
    loadRooms();
});