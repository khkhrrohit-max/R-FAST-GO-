const user = JSON.parse(localStorage.getItem("loggedInUser"));

// Redirect if not logged in
if (!user) {
    window.location.href = "login.html";
}

// Show Profile
document.getElementById("userName").innerText = "Name: " + user.name;
document.getElementById("userNumber").innerText = "Mobile: +91 " + user.number;

// Load ride history
let rides = JSON.parse(localStorage.getItem("rides_" + user.number)) || [];

function displayRides() {
    const historyDiv = document.getElementById("rideHistory");
    historyDiv.innerHTML = "";

    if (rides.length === 0) {
        historyDiv.innerHTML = "<p class='no-ride'>No rides booked yet.</p>";
        return;
    }

    rides.forEach((ride, index) => {
        const div = document.createElement("div");
        div.className = "ride-item";
        div.innerHTML = `
            <strong>Ride ${index + 1}</strong><br>
            Pickup: ${ride.pickup} <br>
            Drop: ${ride.drop} <br>
            Status: ${ride.status}
        `;
        historyDiv.appendChild(div);
    });
}

displayRides();

// Book Ride
function bookRide() {

    const pickup = document.getElementById("pickup").value.trim();
    const drop = document.getElementById("drop").value.trim();

    if (pickup === "" || drop === "") {
        alert("Please enter pickup and drop location");
        return;
    }

    const newRide = {
        pickup: pickup,
        drop: drop,
        status: "Pending"
    };

    rides.push(newRide);

    localStorage.setItem("rides_" + user.number, JSON.stringify(rides));

    document.getElementById("pickup").value = "";
    document.getElementById("drop").value = "";

    displayRides();

    alert("Ride booked successfully 🚗");
}

// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// Delete Account
function deleteAccount() {
    if (confirm("Are you sure you want to delete your account?")) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("rides_" + user.number);
        window.location.href = "login.html";
    }
}
