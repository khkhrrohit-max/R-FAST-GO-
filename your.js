// ================= LOGIN CHECK =================
const loggedInNumber = localStorage.getItem("loggedInRider");

if (!loggedInNumber) {
    alert("Login First");
    window.location.href = "loginrider.html";
}

const riderData = localStorage.getItem("rider_" + loggedInNumber);

if (!riderData) {
    alert("Rider not found!");
    window.location.href = "loginrider.html";
}

const rider = JSON.parse(riderData);

// ================= SET PROFILE =================
document.getElementById("name").innerText = rider.name;
document.getElementById("mobile").innerText = loggedInNumber;
document.getElementById("vehicle").innerText = rider.vehicle;
document.getElementById("plate").innerText = rider.plate;


// ================= PROFILE IMAGE =================
const profileImage = document.getElementById("profileImage");
const uploadImage = document.getElementById("uploadImage");

let savedImage = localStorage.getItem("profileImage_" + loggedInNumber);

if (savedImage) profileImage.src = savedImage;

uploadImage.addEventListener("change", function () {

    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        profileImage.src = reader.result;
        localStorage.setItem("profileImage_" + loggedInNumber, reader.result);
    };

    reader.readAsDataURL(file);
});


// ================= STATS =================
let statsKey = "stats_" + loggedInNumber;

let stats = JSON.parse(localStorage.getItem(statsKey)) || {
    accepted: 0,
    declined: 0,
    completed: 0,
    earnings: 0,
    history: []
};


// ================= AUTO SAVE COMPLETED RIDE =================
function checkCompletedRide() {

    const requestKey = "rideRequest_" + loggedInNumber;
    const rideRequest = JSON.parse(localStorage.getItem(requestKey));
if (rideRequest && rideRequest.status === "completed") {

        // Prevent duplicate save
        if (!rideRequest.savedToHistory) {

            stats.accepted += 1;
            stats.completed += 1;
            stats.earnings += rideRequest.fare;

            stats.history.push({
                from: rideRequest.pickup,
                to: rideRequest.drop,
                fare: rideRequest.fare,
                status: "Completed"
            });

            rideRequest.savedToHistory = true;

            localStorage.setItem(requestKey, JSON.stringify(rideRequest));
            localStorage.setItem(statsKey, JSON.stringify(stats));

            updateStats();
            loadHistory();
        }
    }
}

setInterval(checkCompletedRide, 2000);


// ================= UPDATE STATS =================
function updateStats() {

    document.getElementById("accepted").innerText = stats.accepted;
    document.getElementById("declined").innerText = stats.declined;
    document.getElementById("completed").innerText = stats.completed;
    document.getElementById("earnings").innerText = stats.earnings;

    localStorage.setItem(statsKey, JSON.stringify(stats));
}

updateStats();
loadHistory();


// ================= LOAD HISTORY =================
function loadHistory() {

    const table = document.getElementById("historyTable");
    table.innerHTML = "";

    stats.history.forEach(ride => {

        table.innerHTML += `
            <tr>
                <td>${ride.from}</td>
                <td>${ride.to}</td>
                <td>₹${ride.fare}</td>
                <td>${ride.status}</td>
            </tr>
        `;
    });
}


// ================= LOGOUT =================
document.getElementById("logoutBtn").addEventListener("click", function () {

    localStorage.removeItem("loggedInRider");

    alert("Logged Out Successfully");
    window.location.href = "loginrider.html";
});