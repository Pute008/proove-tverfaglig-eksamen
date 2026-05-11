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

async function userInfo() {
    const userInfoDiv = document.querySelector("#userInfo");
    try {
        const response = await fetch("/showInfoAdmin");
        if (!response.ok) {
            throw new Error("Could not get info. Are you logged in?");
        }
        const users = await response.json();

        users.forEach(classItem => {
            const rad = document.createElement("div");
            rad.classList.add('class');

            const fullName = document.createElement("p");
            fullName.textContent = `Teacher: ${classItem.firstname} ${classItem.lastname}`;
            rad.appendChild(fullName);

            const email = document.createElement("p");
            email.textContent = `Email: ${classItem.email}`;
            rad.appendChild(email);

            const role = document.createElement("p");
            role.textContent = "Role: " + classItem.role_name;
            rad.appendChild(role);

            const classes = document.createElement("p");
            classes.textContent = "Class: " + classItem.class_name;
            rad.appendChild(classes);

            const modell_name = document.createElement("p")
            modell_name.textContent = "Modell name: " + classItem.modell_name;
            rad.appendChild(modell_name);

            const service_tag = document.createElement("p")
            service_tag.textContent = "Service Tag: " + classItem.service_tag;
            rad.appendChild(service_tag);

            userInfoDiv.appendChild(rad);
        });
    } catch (error) {
        console.error("Error:", error);
        userInfoDiv.innerHTML = "<p>Could not load users information. Are you logged in?</p>";
    }
}

document.addEventListener("DOMContentLoaded", userInfo);