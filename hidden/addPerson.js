document.getElementById("newUserForm").addEventListener("submit", async function addPerson(event) {
    event.preventDefault();

    // henter verdier fra html-element
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // const role = document.getElementById("role").value;
    // const classes = document.getElementById("classes").value

    console.log(email)
    try {
        const response = await fetch("/adminNewUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                password
                // role,
                // classes
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
