// ================= WAIT FOR PAGE LOAD =================
document.addEventListener("DOMContentLoaded", function () {
(function(){
    emailjs.init("oJsKfBhacylKGQmXb"); // 🔥 Put your real Public Key here
})();
// ================= GLOBAL =================
let generatedOTP = "";
let otpVerified = false;
let timer;
let timeLeft = 60;

// ================= COMMON FUNCTIONS =================
function isValidIndianNumber(number) {
    return /^[6-9]\d{9}$/.test(number);
}

function isValidPlate(plate) {
    return /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(plate);
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Convert file to Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ================= SELECT ALL INPUTS =================
const inputs = document.querySelectorAll("input");
const buttons = document.querySelectorAll("button");
const selectVehicle = document.querySelector("select");
const checkbox = document.querySelector("input[type='checkbox']");

const nameInput = inputs[0];
const numberInput = inputs[1];
const otpInput = inputs[2];
const plateInput = inputs[3];

const getOtpBtn = buttons[1];
const verifyOtpBtn = buttons[2];
const verifyPlateBtn = buttons[4];
const submitBtn = document.getElementById("submitBtn");

const yourIdVerifyBtn = buttons[5];
const dlVerifyBtn = buttons[6];
const rcVerifyBtn = buttons[7];
const carDocVerifyBtn = buttons[8];

// ================= OTP TIMER =================
function startTimer() {
    timeLeft = 60;
    getOtpBtn.disabled = true;
    getOtpBtn.innerText = "Resend in 60s";

    timer = setInterval(() => {
        timeLeft--;
        getOtpBtn.innerText = "Resend in " + timeLeft + "s";

        if (timeLeft <= 0) {
            clearInterval(timer);
            getOtpBtn.disabled = false;
            getOtpBtn.innerText = "GET OTP";
        }
    }, 1000);
}

// ================= GET OTP =================
getOtpBtn.addEventListener("click", function () {

    const name = nameInput.value.trim();
    const number = numberInput.value.trim();

    if (name === "") {
        alert("Enter your name");
        return;
    }

    if (!isValidIndianNumber(number)) {
        alert("Enter valid 10 digit Indian number");
        return;
    }

    generatedOTP = generateOTP();
    alert("Demo OTP: " + generatedOTP);
    startTimer();
});

// ================= VERIFY OTP =================
verifyOtpBtn.addEventListener("click", function () {

    if (otpInput.value.trim() === generatedOTP && generatedOTP !== "") {
        otpVerified = true;
        alert("OTP Verified ✅");
    } else {
        otpVerified = false;
        alert("Wrong OTP ❌");
    }
});

// ================= VERIFY PLATE =================
verifyPlateBtn.addEventListener("click", function () {

    const plate = plateInput.value.trim().toUpperCase();

    if (!isValidPlate(plate)) {
        alert("Invalid Plate Format (Example: HR26AB1234)");
        return;
    }

    alert("Plate Verified ✅");
});

// ================= FILE VERIFY =================
[yourIdVerifyBtn, dlVerifyBtn, rcVerifyBtn, carDocVerifyBtn]
.forEach((button) => {

    button.addEventListener("click", function () {

        const parent = button.parentElement;
        const fileInput = parent.querySelector("input[type='file']");

        if (!fileInput.files.length) {
            alert("Please select a file first!");
            return;
        }

        button.innerText = "Verified ✅";
        button.disabled = true;
    });
});

// ================= FINAL SUBMIT =================
submitBtn.addEventListener("click", async function (e) {

    e.preventDefault(); // stop form reload

    const name = nameInput.value.trim();
    const number = numberInput.value.trim();
    const vehicle = selectVehicle.value;
    const plate = plateInput.value.trim().toUpperCase();

    if (name === "" || number === "" || plate === "") {
        alert("Please fill all details");
        return;
    }

    if (!otpVerified) {
        alert("Please verify OTP first");
        return;
    }

    if (!checkbox.checked) {
        alert("Accept terms & conditions");
        return;
    }

    try {
        const response = await emailjs.send("service_dti5zdd", "template_0dq57aq", {
            rider_name: name,
            rider_number: number,
            rider_vehicle: vehicle,
            rider_plate: plate,
            to_email: "khkhrrohit@gmail.com"
        });
localStorage.setItem("rider_" + number, JSON.stringify({
    name: name,
    number: number,
    vehicle: vehicle,
    plate: plate
}));
        alert("🎉 Signup Successful & Email Sent!");
        window.location.href = "loginrider.html";
        

    } catch (error) {
        console.log("EMAIL ERROR:", error);
        alert("Signup saved but Email failed ❌");
    }

});

});

