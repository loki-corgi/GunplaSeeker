const minSlider = document.getElementById("min-price");
const maxSlider = document.getElementById("max-price");
const minDisplay = document.getElementById("min-price-display");
const maxDisplay = document.getElementById("max-price-display");

function updatePriceDisplay() {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);

    // Prevent min price from exceeding max price
    if (min > max) {
        min = max;
        minSlider.value = min;
    }

    minDisplay.textContent = min;
    maxDisplay.textContent = max;
}