async function userInfo() {
    const userInfoDiv = document.querySelector("#userInfo");
    try {
        const response = await fetch("/userInfo");
        if (!response.ok) {
            throw new Error("Could not get info. Are you logged in?");
        }
        const user = await response.json();

        const card = document.createElement("div");
        card.classList.add('userCard');

        const info = document.createElement("h1")
        info.textContent = "User info:"
        card.appendChild(info)

        const fullname = document.createElement("p");
        fullname.textContent = `Fullname: ${user.firstname} ${user.lastname}`;
        card.appendChild(fullname);

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;
        card.appendChild(email);

        const roles = document.createElement("p");
        roles.textContent = `Role: ${user.role_name}`;
        card.appendChild(roles);

        const classes = document.createElement("p");
        classes.textContent = `Class: ${user.class_name}`;
        card.appendChild(classes);

        const userId = document.createElement("p");
        userId.textContent = `User ID: ${user.id}`;
        card.appendChild(userId);

        userInfoDiv.innerHTML = "";
        userInfoDiv.appendChild(card);
    } catch (error) {
        console.error("Error:", error);
        userInfoDiv.innerHTML = "<p>Could not load user information. Are you logged in?</p>";
    }
}

document.addEventListener("DOMContentLoaded", userInfo);