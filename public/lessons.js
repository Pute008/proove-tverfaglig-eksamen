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

async function showLessons () {
    const tabellBody = document.querySelector("#lessonsList");
    try {
        const response = await fetch("/showYourLessons")
        if (!response.ok) {
            throw new Error("Could not get the classes. Are you logged in?");
        }

        const classes = await response.json();

        classes.forEach(classItem => {
            const rad = document.createElement("div");
            rad.classList.add('class');

            const title = document.createElement("h1");
            title.textContent = "Subject: " + classItem.subject_name;
            rad.appendChild(title);

            const fullName = document.createElement("p");
            fullName.textContent = `Teacher: ${classItem.firstname} ${classItem.lastname}`;
            rad.appendChild(fullName);

            const room = document.createElement("p");
            room.textContent = "Room: " + classItem.room_name;
            rad.appendChild(room);

            const classes = document.createElement("p");
            classes.textContent = "Class: " + classItem.class_name;
            rad.appendChild(classes);

            const maxParticipants = document.createElement("p")
            maxParticipants.textContent = "Start time: " + classItem.start_time;
            rad.appendChild(maxParticipants);

            const timeMinutes = document.createElement("p")
            timeMinutes.textContent = "End time: " + classItem.end_time;
            rad.appendChild(timeMinutes);

            tabellBody.appendChild(rad);
        });
    } catch (error) {
        console.error("Fail:", error);
        tabellBody.innerHTML = `<div>Could not get the classes: ${error.message}</div>`;
    }
}

document.addEventListener("DOMContentLoaded", showLessons);