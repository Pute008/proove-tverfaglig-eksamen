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

document.getElementById("newUserForm").addEventListener("submit", async function addPerson(event) {
    event.preventDefault();

    // henter verdier fra html-element
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const classes = document.getElementById("classes").value

    console.log(email)
    try {
        const response = await fetch("/newLesson", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                password,
                role,
                classes
            })
            
        });

        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + (result.error || result.message));
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Error creating user: " + error.message);
    }
})

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

async function loadRoles() {
    try {
        const response = await fetch("/getRoles");
        if (!response.ok) throw new Error("Could not load roles");
        const roles = await response.json();
        const select = document.getElementById("role");
        roles.forEach(roleItem => {
            const option = document.createElement("option");
            option.value = roleItem.id;
            option.textContent = roleItem.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading roles:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadRoles();
    loadClasses();
});