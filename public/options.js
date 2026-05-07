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

// async function loadAdminOptions() {
//     try {
//         const response = await fetch("/userInfo");
//         if (response.ok) {
//             const user = await response.json();
//             if (user.role_name === "Admin" || user.role_id === 3) {
//                 document.getElementById("adminOptions").innerHTML = '<p><a href="/addPerson">Add Person</a></p>';
//             }
//         }
//     } catch (error) {
//         console.error("Error loading admin options:", error);
//     }
// }
// loadAdminOptions();