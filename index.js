
const checkbox = document.querySelector("input[type='checkbox']");
const buttons = document.querySelectorAll("button");

buttons.forEach(function(button) {
    button.addEventListener("click", function(event) {

        if (!checkbox.checked) {
            event.preventDefault();
            alert("Please agree to the Terms and Conditions first!");
        } else {
            alert("Thank you for agreeing!");
        }

    });
});
