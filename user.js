// ================= GLOBAL =================
let generatedOTP = "";
let currentNumber = "";
let otpVerified = false;

// ================= VALIDATION =================
function isValidIndianNumber(number) {
    return /^[6-9]\d{9}$/.test(number);
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ================= SIGNUP PAGE =================
if (window.location.pathname.includes("signin")) {

    const nameInput = document.getElementById("signupName");
    const numberInput = document.getElementById("signupNumber");
    const otpInput = document.getElementById("signupOtp");

    const getOtpBtn = document.getElementById("signupGetOtp");
    const verifyBtn = document.getElementById("signupVerify");

    getOtpBtn.addEventListener("click", () => {

        const name = nameInput.value.trim();
        const number = numberInput.value.trim();

        if (name === "") {
            alert("Enter your name");
            return;
        }

        if (!isValidIndianNumber(number)) {
            alert("Enter valid Indian mobile number");
            return;
        }

        // 🔴 Check if already exists
        if (localStorage.getItem(number)) {
            alert("⚠ Number already exists! Please login.");
            return;
        }

        generatedOTP = generateOTP();
        currentNumber = number;

        alert("Your OTP is: " + generatedOTP); // Practice mode
    });

    verifyBtn.addEventListener("click", () => {

        const enteredOTP = otpInput.value.trim();

        if (enteredOTP === generatedOTP) {

            const userData = {
                name: nameInput.value.trim(),
                number: currentNumber
            };

            localStorage.setItem(currentNumber, JSON.stringify(userData));

            alert("Signup Successful 🎉");

            window.location.href = "login.html";

        } else {
            alert("Wrong OTP ❌");
        }
    });
}

// ================= LOGIN PAGE =================
if (window.location.pathname.includes("login")) {

    const numberInput = document.getElementById("loginNumber");
    const otpInput = document.getElementById("loginOtp");

    const getOtpBtn = document.getElementById("loginGetOtp");
    const verifyBtn = document.getElementById("loginVerify");
    const loginBtn = document.getElementById("loginBtn");

    getOtpBtn.addEventListener("click", () => {

        const number = numberInput.value.trim();

        if (!isValidIndianNumber(number)) {
            alert("Enter valid mobile number");
            return;
        }

        if (!localStorage.getItem(number)) {
            alert("Number not registered ❌");
            return;
        }

        generatedOTP = generateOTP();
        currentNumber = number;

        alert("Your OTP is: " + generatedOTP);
    });

    verifyBtn.addEventListener("click", () => {

        const enteredOTP = otpInput.value.trim();

        if (enteredOTP === generatedOTP) {
            otpVerified = true;
            alert("OTP Verified ✅");
        } else {
            alert("Wrong OTP ❌");
        }
    });

    loginBtn.addEventListener("click", () => {

        if (!otpVerified) {
            alert("Please verify OTP first");
            return;
        }

        const userData = JSON.parse(localStorage.getItem(currentNumber));

        localStorage.setItem("loggedInUser", JSON.stringify(userData));

        alert("Login Successful 🎉");

        window.location.href = "useryour.html";
    });
}