const amount = document.getElementById("amount"),
    select = document.querySelectorAll(".select"),
    from = document.getElementById("from"),
    to = document.getElementById("to"),
    result = document.getElementById("rate"),
    convertBtn = document.getElementById("convert-icon"),
    calculateBtn = document.querySelector(".convert-btn");

async function getRate() {
    const response = await fetch(`https://api.exchangerate.host/latest?base=USD`);
    var data = await response.json();
    const rates = data.rates;
    if (response) {
        updateOptions(from, getList(rates));
        updateOptions(to, getList(rates));
    } else {
        throw new Error(response.status);
    }
}

getRate();

function getList(rates) {
    const arrKeys = Object.keys(rates);
    let liArr = [];
    arrKeys.map(async (item) => {
        const li = document.createElement("li");
        const country = item.slice(0, -1);

        const flagImageUrl = await getFlagImage(country);

        li.innerHTML = `
      <img src="${flagImageUrl}" alt="${country}" />
      <span>${item}</span>
    `;

        li.addEventListener("click", () => {
            li.parentElement.parentElement.querySelector("span").innerHTML = item;
            li.parentElement.parentElement.querySelector("img").src = flagImageUrl;
            li.parentElement.querySelectorAll("li").forEach((li) => {
                li.classList.remove("active");
            });
            li.classList.add("active");
            calculate();
        });

        liArr.push(li);
    });
    return liArr;
}

function updateOptions(select, options) {
    const ul = document.createElement("ul");
    options.forEach((option) => {
        ul.appendChild(option);
    });
    select.appendChild(ul);
}

async function getFlagImage(countryCode) {
    const flagUrl = `https://countryflagsapi.com/png/${countryCode}`;
    return fetch(flagUrl)
        .then((response) => {
            if (response.ok) {
                return flagUrl;
            } else {
                return "https://via.placeholder.com/20"; // Fallback flag
            }
        })
        .catch(() => {
            return "https://via.placeholder.com/20"; // Fallback flag
        });
}

async function calculate() {
    if (amount.value === "" || amount.value === "0") {
        return;
    }

    calculateBtn.innerHTML = "Calculating...";
    calculateBtn.disabled = true;

    const fromCurrency = from.querySelector("span").innerHTML;
    const toCurrency = to.querySelector("span").innerHTML;
    const fromAmount = amount.value;

    await fetch(
            `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}&amount=${amount.value}&places=2`
        )
        .then((res) => res.json())
        .then((data) => {
            const rate = data.rates[toCurrency];
            result.innerHTML = `${rate} ${toCurrency}`;
        });

    calculateBtn.innerHTML = "Convert";
    calculateBtn.disabled = false;
}

select.forEach((item) => {
    item.addEventListener("click", () => {
        item.classList.toggle("active");
    });
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".select")) {
        select.forEach((item) => {
            item.classList.remove("active");
        });
    }
});

amount.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9.]/g, "");
    calculate();
});

calculateBtn.addEventListener("click", () => {
    calculate();
});

convertBtn.addEventListener("click", () => {
    const fromSelected = from.querySelector("span").innerHTML;
    const toSelected = to.querySelector("span").innerHTML;
    const fromImg = from.querySelector("img").src;
    const toImg = to.querySelector("img").src;

    from.querySelector("span").innerHTML = toSelected;
    to.querySelector("span").innerHTML = fromSelected;
    from.querySelector("img").src = toImg;
    to.querySelector("img").src = fromImg;

    calculate();
});
