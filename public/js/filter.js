document.addEventListener('DOMContentLoaded', () => {
    const minSlider = document.getElementById("minPrice");
    const maxSlider = document.getElementById("maxPrice");
    const minDisplay = document.getElementById("min-price-display");
    const maxDisplay = document.getElementById("max-price-display");

    const MAX_PRICE = 1010;

    const updatePriceDisplay = () => {
        let min = parseInt(minSlider.value);
        let max = parseInt(maxSlider.value);

        // Enforce constraint: min can't be greater than max
        if (min > max) {
            maxSlider.value = min;
        }

        minDisplay.textContent = minSlider.value;
        maxDisplay.textContent = maxSlider.value;

        if(max >= MAX_PRICE) {
            maxDisplay.textContent = '∞';
        }

    };

     minSlider.addEventListener('input', () => {
        if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
            maxSlider.value = minSlider.value;
        }

        updatePriceDisplay();
    });

    maxSlider.addEventListener('input', () => {
        if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
            minSlider.value = maxSlider.value;
        }

        updatePriceDisplay();
    });
     
});