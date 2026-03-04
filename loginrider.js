// ================= WAIT FOR PAGE LOAD =================
document.addEventListener("DOMContentLoaded", function () {

    let generatedOTP = "";
    let timer;
    let timeLeft = 60;

    function isValidIndianNumber(number) {
        return /^[6-9]\d{9}$/.test(number);
    }

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    const numberInput = document.getElementById("loginNumber");
    const otpInput = document.getElementById("loginOtp");
    const getOtpBtn = document.getElementById("getOtpBtn");
    const loginBtn = document.getElementById("loginBtn");

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

        const number = numberInput.value.trim();

        if (!isValidIndianNumber(number)) {
            alert("Enter valid number");
            return;
        }

        const riderData = localStorage.getItem("rider_" + number);

        if (!riderData) {
            alert("Rider not registered ❌ Please Signup First");
            return;
        }

        generatedOTP = generateOTP();
        alert("Demo OTP: " + generatedOTP);

        startTimer();
    });

    // ================= LOGIN BUTTON =================
    loginBtn.addEventListener("click", function () {

        const number = numberInput.value.trim();
        const otp = otpInput.value.trim();

        if (otp === generatedOTP && generatedOTP !== "") {

            localStorage.setItem("loggedInRider", number);

            alert("Login Successful ✅");
            window.location.href = "riderpage.html";

        } else {
            alert("Wrong OTP ❌");
        }

    });

});