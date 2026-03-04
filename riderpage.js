// ================= GLOBAL VARIABLES =================
let riderId;

let companyKey;
let loggedInNumber = localStorage.getItem("loggedInRider");
let walletKey = "wallet_" + loggedInNumber;
// ================= INITIAL SETUP =================
document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(window.location.search);

    // Get rider phone from URL
    riderId = urlParams.get("phone");

    if (!riderId) {
        alert("Rider not logged in properly");
        return;
    }

    walletKey = "riderWallet_" + riderId;
    companyKey = "fastGoCompanyAccount";

    // INIT RIDER WALLET
    if (!localStorage.getItem(walletKey)) {
        localStorage.setItem(walletKey, JSON.stringify({ balance: 0 }));
    }

    // INIT COMPANY WALLET
    if (!localStorage.getItem(companyKey)) {
        localStorage.setItem(companyKey, JSON.stringify({ balance: 0 }));
    }

    checkWalletLimit();
 let wallet = JSON.parse(localStorage.getItem(walletKey));

if (wallet && wallet.balance <= -500) {
    disableAllRides();
}
});


// ================= COMMISSION SYSTEM =================
function processRidePayment(fareAmount, paymentMethod) {

    let wallet = JSON.parse(localStorage.getItem(walletKey));
    let company = JSON.parse(localStorage.getItem(companyKey));

    let commission = fareAmount * 0.25;
    let riderShare = fareAmount * 0.75;

    // ===== ONLINE PAYMENT =====
    if (paymentMethod === "online") {

        wallet.balance += riderShare;
        company.balance += commission;

        alert("Online Ride ✅\nCommission ₹" + commission + " deducted automatically.");
    }

    // ===== CASH PAYMENT =====
    else if (paymentMethod === "cash") {

        let newBalance = wallet.balance - commission;

        // ❌ STOP IF BELOW -500
        if (newBalance < -500) {
            alert("⚠ Wallet limit -₹500 reached.\nRecharge Required.");
            disableAcceptButton();
            return;
        }

        wallet.balance = newBalance;
        company.balance += commission;

        alert("Cash Ride ✅\nCommission ₹" + commission + " deducted.");
    }

    localStorage.setItem(walletKey, JSON.stringify(wallet));
    localStorage.setItem(companyKey, JSON.stringify(company));

    checkWalletLimit();
}


// ================= NEGATIVE LIMIT CHECK =================
function checkWalletLimit() {

    let wallet = JSON.parse(localStorage.getItem(walletKey));

    if (wallet && wallet.balance <= -500) {
        disableAllRides();
    }
}

// ================= DISABLE ACCEPT =================
function disableAcceptButton() {

    const acceptBtn = document.getElementById("acceptBtn");

    if (acceptBtn) {
        acceptBtn.disabled = true;
        acceptBtn.innerText = "Recharge Required";
        acceptBtn.style.backgroundColor = "gray";
    }
}


// ================= MAP SYSTEM =================
// ================= GLOBAL MAP VARIABLES =================
let map;
let riderMarker;
let userMarker;
let routingControl;
let watchId;

// ================= MAP SYSTEM =================
document.addEventListener("DOMContentLoaded", function () {

    map = L.map('mapContainer').setView([24.8170, 93.9368], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap"
    }).addTo(map);

});

// ================= ONLINE / OFFLINE =================
window.toggleStatus = function () {

    const statusText = document.getElementById("status");
    const button = document.querySelector(".rider-box button");

    let online = statusText.innerText.trim() === "Offline";

    if (online) {

        statusText.innerHTML = "Online";
        statusText.style.color = "green";
        button.innerText = "Go Offline";

        watchId = navigator.geolocation.watchPosition(function (pos) {

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            if (!riderMarker) {
                riderMarker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("You (Rider)")
                    .openPopup();
            } else {
                riderMarker.setLatLng([lat, lng]);
            }

            map.setView([lat, lng], 15);

            // SAVE FOR USER PAGE
            // Get real rider data
let riderData = JSON.parse(localStorage.getItem("riderData_" + riderId));

if (!riderData) {
    alert("Rider data not found!");
    return;
}

localStorage.setItem("activeRider_" + riderId, JSON.stringify({
    phone: riderData.phone,
    name: riderData.name,
    vehicle: riderData.vehicle,
    plate: riderData.plate,
    lat: lat,
    lng: lng,
    online: true
}));
        });

    } else {

        statusText.innerHTML = "Offline";
        statusText.style.color = "red";
        button.innerText = "Go Online";

        navigator.geolocation.clearWatch(watchId);

        localStorage.removeItem("activeRider_" + riderId);

        if (riderMarker) map.removeLayer(riderMarker);
    }
};


// ================= ACCEPT RIDE =================
window.acceptRide = function (pickupLat, pickupLng, dropLat, dropLng, fare) {

    if (!riderMarker) {
        alert("Go Online First!");
        return;
    }

    const requestKey = "rideRequest_" + riderId;

    const rideRequest = {
        pickup: "Pickup Location",
        drop: "Drop Location",
        fare: fare,
        status: "accepted"
    };

    localStorage.setItem(requestKey, JSON.stringify(rideRequest));

    localStorage.setItem("rideStatus_user", JSON.stringify({
        status: "accepted",
        rider: riderId
    }));

    // ===== MAP CODE (KEEP SAME) =====
    if (userMarker) map.removeLayer(userMarker);

    userMarker = L.marker([pickupLat, pickupLng])
        .addTo(map)
        .bindPopup("User Pickup Location")
        .openPopup();

    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
        waypoints: [
            riderMarker.getLatLng(),
            L.latLng(pickupLat, pickupLng),
            L.latLng(dropLat, dropLng)
        ],
        routeWhileDragging: false
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
        const route = e.routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(2);
        alert("Ride Accepted 🚖\nDistance: " + distance + " KM");
    });
};
function completeRide() {

    const requestKey = "rideRequest_" + riderId;
    const rideRequest = JSON.parse(localStorage.getItem(requestKey));

    if (!rideRequest || rideRequest.status !== "accepted") {
        alert("No active ride to complete!");
        return;
    }

    let fare = parseFloat(rideRequest.fare);
    let commission = fare * 0.25;

    let wallet = JSON.parse(localStorage.getItem(walletKey));

    // Deduct commission
    wallet.balance -= commission;

    localStorage.setItem(walletKey, JSON.stringify(wallet));

    // Negative limit check
    if (wallet.balance <= -500) {
        alert("⚠ Wallet limit -₹500 reached.\nRecharge Required!");
        disableAllRides();
    }

    // Mark ride completed
    rideRequest.status = "completed";
    localStorage.setItem(requestKey, JSON.stringify(rideRequest));

    alert("Ride Completed ✅\nCommission ₹" + commission + " deducted");

    // Remove route
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
    }
}
function disableAllRides() {

    const buttons = document.querySelectorAll(".ride-card button");

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.innerText = "Recharge Required";
        btn.style.backgroundColor = "gray";
    });
}
// ================= LIVE RIDE REQUEST LISTENER =================
setInterval(function () {

    const requestKey = "rideRequest_" + riderId;
    const rideRequest = JSON.parse(localStorage.getItem(requestKey));

  let wallet = JSON.parse(localStorage.getItem(walletKey));

if (
    rideRequest &&
    rideRequest.status === "pending" &&
    wallet &&
    wallet.balance > -500
) {

        document.getElementById("rideInfo").innerHTML = `
            <h2>New Ride Request 🚖</h2>
            <p><strong>Pickup:</strong> ${rideRequest.pickup}</p>
            <p><strong>Drop:</strong> ${rideRequest.drop}</p>
            <p><strong>Fare:</strong> ₹${rideRequest.fare}</p>
        `;

        // ACCEPT BUTTON
        document.getElementById("acceptBtn").onclick = function () {

            rideRequest.status = "accepted";
            localStorage.setItem(requestKey, JSON.stringify(rideRequest));

            localStorage.setItem("rideStatus_user", JSON.stringify({
                status: "accepted",
                rider: riderId
            }));

            alert("Ride Accepted 🚖");
        };

        // REJECT BUTTON
        document.getElementById("rejectBtn").onclick = function () {

            localStorage.removeItem(requestKey);
            alert("Ride Rejected ❌");
        };
    }

}, 2000);


// ================= SUPABASE REALTIME =================
supabaseClient
.channel('new-rides')
.on(
    'postgres_changes',
    {
        event: 'INSERT',
        schema: 'public',
        table: 'rides'
    },
    (payload) => {

        const ride = payload.new;

        if (ride.status === "pending") {
            alert("New Ride Request 🚖");
        }

    }
)
.subscribe();