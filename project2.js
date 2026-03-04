document.addEventListener("DOMContentLoaded", function () {

    const pickupSelect = document.getElementById("pickup");
    const dropSelect = document.getElementById("drop");
    const chooseBtn = document.getElementById("chooseLocationBtn");
    const searchBtn = document.getElementById("searchRideBtn");
    const vehicleSelect = document.getElementById("vehicle");
    const rideStatus = document.getElementById("rideStatus");
    const rideDetails = document.getElementById("rideDetails");
    const vehicleList = document.getElementById("vehicleList");

    let locationCoords = {};
    let map, routingControl;
    let riderMarkers = {};
let nearestRider = null;
    // ================= LOAD LOCATIONS =================
fetch("manipur.txt")
    .then(res => res.text())
    .then(data => {

        const lines = data.split("\n");

        lines.forEach(line => {

            if (line.trim() === "") return;

            const parts = line.split(" - ");
            const place = parts[1]?.split("(")[0].trim();

            if (place) {
                pickupSelect.innerHTML += `<option value="${place}">${place}</option>`;
                dropSelect.innerHTML += `<option value="${place}">${place}</option>`;

                locationCoords[place] = [
                    24.5 + Math.random(),
                    93.5 + Math.random()
                ];
            }
        });

        // 🔥🔥🔥 ADD THIS LINE HERE
        localStorage.setItem("locationCoords", JSON.stringify(locationCoords));

    });

    // ================= MAP INIT =================
    map = L.map('map').setView([24.8170, 93.9368], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    // ================= AUTO PICK NEAREST =================
    chooseBtn.addEventListener("click", function () {

        navigator.geolocation.getCurrentPosition(function (pos) {

            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            let nearest = "";
            let min = Infinity;

            for (let place in locationCoords) {

                const [lat, lng] = locationCoords[place];

                const dist = Math.sqrt(
                    (userLat - lat) ** 2 +
                    (userLng - lng) ** 2
                );

                if (dist < min) {
                    min = dist;
                    nearest = place;
                }
            }

            pickupSelect.value = nearest;
            alert("Nearest location selected: " + nearest);

        }, function () {
            alert("Please allow location access.");
        });

    });

    // ================= SEARCH RIDE =================
    searchBtn.addEventListener("click", function () {

        const pickup = pickupSelect.value;
        const drop = dropSelect.value;
        const vehicle = vehicleSelect.value;

        if (!pickup || !drop) {
            rideStatus.innerHTML = "Please select pickup and drop.";
            return;
        }

        if (pickup === drop) {
            rideStatus.innerHTML = "Pickup & Drop cannot be same.";
            return;
        }

        const [pickupLat, pickupLng] = locationCoords[pickup];
        const [dropLat, dropLng] = locationCoords[drop];

        if (routingControl) map.removeControl(routingControl);

        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickupLat, pickupLng),
                L.latLng(dropLat, dropLng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            show: false
        }).addTo(map);

        routingControl.on('routesfound', function (e) {

            const route = e.routes[0];
            const distance = (route.summary.totalDistance / 1000).toFixed(2);

            let perKm = vehicle === "Bike" ? 10 :
                        vehicle === "Auto" ? 13 : 19;

            const fare = Math.round(distance * perKm);

            rideDetails.innerHTML = `
                Distance: ${distance} KM <br>
                Price per KM: ₹${perKm} <br>
                Total Fare: ₹${fare}
            `;

           rideStatus.innerHTML = "Active Riders Found 🚖";
           rideDetails.innerHTML += `
    <br><br>
    <button id="bookRideBtn">Book Ride</button>
`;
        });

        map.fitBounds([
            [pickupLat, pickupLng],
            [dropLat, dropLng]
        ]);

        showAllActiveRiders(vehicle, pickupLat, pickupLng);
    });
    // ================= BOOK RIDE =================
document.addEventListener("click", function (e) {

if (e.target.id === "bookRideBtn") {

    if (!nearestRider) {
        alert("No rider available!");
        return;
    }

    const currentUserPhone = localStorage.getItem("currentUserPhone");

    if (!currentUserPhone) {
        alert("User not logged in!");
        return;
    }

    const currentUserData = localStorage.getItem("user_" + currentUserPhone);

    if (!currentUserData) {
        alert("User data not found!");
        return;
    }

    const currentUser = JSON.parse(currentUserData);

// Get coordinates
const pickup = pickupSelect.value;
const drop = dropSelect.value;

const [pickupLat, pickupLng] = locationCoords[pickup];
const [dropLat, dropLng] = locationCoords[drop];

const request = {
    userName: currentUser.name,
    userPhone: currentUser.phone,
    pickup: pickup,
    drop: drop,
    pickupLat: pickupLat,
    pickupLng: pickupLng,
    dropLat: dropLat,
    dropLng: dropLng,
  fare: document.querySelector("#rideDetails").innerText.match(/\d+$/)?.[0] || 0,
    payment: "cash",
    time: new Date().toLocaleTimeString(),
    status: "pending"
};
        localStorage.setItem(
            "rideRequest_" + nearestRider.phone,
            JSON.stringify(request)
        );

localStorage.setItem("currentBookedRider", nearestRider.phone);
        rideStatus.innerHTML = "Ride Request Sent To " + nearestRider.name + " 🚀";
        alert("Ride Request Sent 🚖");
    }

});

    // ================= SHOW ALL ACTIVE RIDERS =================
  function showAllActiveRiders(vehicleType, userLat, userLng) {

    vehicleList.innerHTML = "";

    Object.values(riderMarkers).forEach(marker => map.removeLayer(marker));
    riderMarkers = {};

    let riders = [];

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);
        if (!key.startsWith("activeRider_")) continue;

        const activeRider = JSON.parse(localStorage.getItem(key));

        if (!activeRider.online) continue;
        if (activeRider.vehicle !== vehicleType) continue;

        const distance = getDistance(
            userLat,
            userLng,
            activeRider.lat,
            activeRider.lng
        );

        // Get full rider profile from rider_ number
 const riderNumber = key.replace("activeRider_", "").trim();

riders.push({
    ...activeRider,
    phone: activeRider.phone || riderNumber,
    distance
});
    }

    riders.sort((a, b) => a.distance - b.distance);
    nearestRider = riders[0]; // closest rider

    if (riders.length === 0) {
        vehicleList.innerHTML = "<p>No active riders found.</p>";
        return;
    }

    rideStatus.innerHTML = "Active Riders Found 🚖";

    riders.forEach(rider => {

        // MAP MARKER
        const marker = L.marker([rider.lat, rider.lng])
            .addTo(map)
            .bindPopup(`
                <b>${rider.name}</b><br>
                ${rider.vehicle}<br>
                ${rider.plate}<br>
                ${rider.phone}
            `);

        riderMarkers[rider.phone] = marker;

        // RIDER CARD FULL DETAILS
        const box = document.createElement("div");
        box.className = "rider-box";

        box.innerHTML = `
            <div style="display:flex; gap:15px;">
                <img src="${rider.image}" width="90" 
                     style="border-radius:10px;">
                <div>
                    <h3>${rider.name}</h3>
                    <p><strong>Phone:</strong> ${rider.phone}</p>
                    <p><strong>Vehicle:</strong> ${rider.vehicle}</p>
                    <p><strong>Plate:</strong> ${rider.plate}</p>
                    <p><strong>Distance:</strong> ${rider.distance.toFixed(2)} KM</p>
                    <p><strong>Status:</strong> 🟢 Online</p>
                </div>
            </div>
        `;

        vehicleList.appendChild(box);
    });
}

    // ================= DISTANCE FUNCTION =================
    function getDistance(lat1, lon1, lat2, lon2) {

        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

});
setInterval(function () {

    const bookedRider = localStorage.getItem("currentBookedRider");

    if (!bookedRider) return;

    const ride = JSON.parse(
        localStorage.getItem("rideRequest_" + bookedRider)
    );

    if (ride && ride.status === "accepted") {

        // Get rider login data
        const riderData = JSON.parse(
            localStorage.getItem("rider_" + bookedRider)
        );

        // Get rider live active data
        const activeData = JSON.parse(
            localStorage.getItem("activeRider_" + bookedRider)
        );

        rideStatus.innerHTML = `
            🚖 ${riderData.name} is Coming! <br>
            Vehicle: ${riderData.vehicle} <br>
            Plate: ${riderData.plate} <br>
           Phone: ${bookedRider}
        `;

    }

}, 2000);
// ================= CHECK IF RIDER ACCEPTED =================
setInterval(function(){

    const status = JSON.parse(localStorage.getItem("rideStatus_user"));

    if(status && status.status === "accepted"){
        rideStatus.innerHTML = "🚖 Rider is Coming!";
    }

},2000);
// ================= SHOW LIVE RIDER =================
setInterval(function () {

    const activeKeys = Object.keys(localStorage).filter(k => k.startsWith("activeRider_"));

    activeKeys.forEach(key => {

        const rider = JSON.parse(localStorage.getItem(key));
        if (!rider || !rider.online) return;

        if (!window.riderMarkerUser) {
            window.riderMarkerUser = L.marker([rider.lat, rider.lng])
                .addTo(map)
                .bindPopup("Rider: " + rider.name);
        } else {
            window.riderMarkerUser.setLatLng([rider.lat, rider.lng]);
        }

    });

}, 2000);