let timerInterval;
let timeLeft = 300; // 5 minutes (300 seconds)
let loggedInNumber = localStorage.getItem("loggedInRider") || "demo";
let walletKey = "wallet_" + loggedInNumber;
let historyKey = "walletHistory_" + loggedInNumber;

let balance = parseFloat(localStorage.getItem(walletKey)) || 0;
let history = JSON.parse(localStorage.getItem(historyKey)) || [];

const balanceDisplay = document.getElementById("balance");
const popup = document.getElementById("paymentPopup");
const timerText = document.getElementById("timerText");
const historyTable = document.getElementById("historyTable");

let selectedMethod = "";
let paymentAmount = 0;

updateBalance();
loadHistory();

function updateBalance(){
    balanceDisplay.innerText = "₹" + balance;
    balanceDisplay.style.color = balance < 0 ? "red" : "green";
    localStorage.setItem(walletKey, balance);
}

document.getElementById("rechargeBtn").onclick = () =>{
    popup.classList.remove("hidden");
};

function closePopup(){
    popup.classList.add("hidden");
    timerText.innerText="";
}

// ================= SELECT PAYMENT METHOD =================
function selectMethod(type){

    const details = document.getElementById("paymentDetails");
    const amount = document.getElementById("amountInput").value;

    if(!amount || amount <= 0){
        alert("Enter Amount First");
        return;
    }

    paymentAmount = parseFloat(amount);

    let upiID = "khkhrrohit@okaxis";
    let upiLink = `upi://pay?pa=${upiID}&pn=FASTGO&am=${amount}&cu=INR`;

    // Start 5 min timer
    startTimer();

    if(type === "qr"){

        details.innerHTML = `
            <p>Scan & Pay ₹${amount}</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}">
            <br><br>
            <a href="${upiLink}">
                <button>Open UPI App</button>
            </a>
        `;
    }

    if(type === "number"){
        details.innerHTML = `
            <p>Send ₹${amount} to:</p>
            <b>${upiID}</b><br><br>
            <a href="${upiLink}">
                <button>Open UPI App</button>
            </a>
        `;
    }

    if(type === "url"){
        details.innerHTML = `
            <p>Click to Pay ₹${amount}</p>
            <a href="${upiLink}">
                <button>Pay via UPI</button>
            </a>
        `;
    }

    details.innerHTML += `
        <br><br>
        <button onclick="confirmPaid()">I Have Paid</button>
    `;
}

// ================= CONFIRM PAYMENT =================
function confirmPaid(){

    // Fake verification delay (real feel)
    timerText.innerHTML = "Verifying Payment... ⏳";

    setTimeout(()=>{

        balance += parseFloat(paymentAmount);
        updateBalance();

        let date = new Date().toLocaleString();
        let billId = "FG" + Math.floor(Math.random()*1000000);

        history.push({
            id: billId,
            amount: paymentAmount,
            date: date
        });

        localStorage.setItem(historyKey, JSON.stringify(history));

        timerText.innerHTML = "✔ Payment Successful";
        timerText.style.color = "green";

        setTimeout(()=>{
            alert("Recharge Complete ✅");
            closePopup();
            loadHistory();
        },1500);

    },3000);
}

// ================= HISTORY =================
function loadHistory(){

    historyTable.innerHTML="";

    history.forEach(item=>{
        historyTable.innerHTML += `
            <tr>
                <td>₹${item.amount}</td>
                <td>${item.date}</td>
                <td>
                    <button onclick="downloadBill('${item.id}',${item.amount},'${item.date}')">
                        Download
                    </button>
                </td>
            </tr>
        `;
    });
}

// ================= DOWNLOAD BILL =================
function downloadBill(id, amount, date){

    let content = `
    FAST GO OFFICIAL RECEIPT
    ---------------------------
    Bill ID: ${id}
    Amount Paid: ₹${amount}
    Date: ${date}
    UPI: khkhrrohit@okaxis
    Status: SUCCESS
    ---------------------------
    Thank You For Payment
    `;

    let blob = new Blob([content], {type:"text/plain"});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = id + ".txt";
    link.click();
}

function startTimer(){

    clearInterval(timerInterval);
    timeLeft = 300;

    timerInterval = setInterval(()=>{

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        timerText.innerHTML = 
            `Time Left: ${minutes}:${seconds < 10 ? "0"+seconds : seconds}`;

        timeLeft--;

        if(timeLeft < 0){
            clearInterval(timerInterval);
            timerText.innerHTML = "Payment Session Expired ❌";
            timerText.style.color = "red";
        }

    },1000);
}