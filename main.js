const formSearch = document.querySelector(".form-search"),
    inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
    dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
    inputCitiesTo = formSearch.querySelector(".input__cities-to"),
    dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
    inputDateDepart = formSearch.querySelector(".input__date-depart"),
    cheapestTicket = document.getElementById("cheapest-ticket"),
    otherCheapTickets = document.getElementById("other-cheap-tickets");

const baseData = "db/cities.json",
    proxy = "https://cors-anywhere.herokuapp.com/",
    API_KEY = "0871bb2af19108ae42e163de81f43c1f",
    calendarApi = "http://min-prices.aviasales.ru/calendar_preload";

let cities = [];

// Functions >>
const getData = async (url, callback) => {
    const res = await fetch(url);
    const data = await res.json();
    callback(data);
};

const showCities = (input, list) => {
    list.textContent = "";
    if (input.value !== "") {
        const searchCities = cities.filter((item) => {
            // item.name may be null
            if (item.name) {
                return item.name
                    .toLowerCase()
                    .startsWith(input.value.toLowerCase());
            }
        });

        searchCities.forEach((item) => {
            const li = document.createElement("li");
            li.classList.add("dropdown__city");
            li.textContent = item.name;
            list.append(li);
        });
    }
};

const selectCity = (e, input, list) => {
    const target = e.target;
    if (target.tagName.toLowerCase() === "li") {
        input.value = target.textContent;
        list.textContent = "";
    }
};

const renderTickets = (info, date) => {
    const bestPrices = info.best_prices;
    debugger;
    const selectedDate = bestPrices.find((item) => item.depart_date === date);
    renderOthers(bestPrices);
    renderDay(selectedDate);
};

const renderOthers = (tickets) => {
    tickets.sort((a, b) => a.value - b.value);
    otherCheapTickets.innerHTML = "";
    tickets.forEach((data, index, arr) => {
        if (arr.length === 0) {
            const error = document.createElement("li");
            error.classList.add("error");
            error.textContent = "По этому маршруту билетов нету";
            otherCheapTickets.append(error);
        } else {
            if (index <= 10) {
                createCard(data, otherCheapTickets);
            } else {
                return;
            }
        }
    });
};

const renderDay = (ticket) => {
    cheapestTicket.innerHTML = "";
    if (ticket === undefined) {
        const error = document.createElement("li");
        error.classList.add("error");
        error.textContent = "На эту дату нету билетов";
        cheapestTicket.append(error);
    } else {
        const card = createCard(ticket, cheapestTicket);
    }
};

const getCityName = (code) => {
    const cityName = cities.find((item) => item.code === code);
    return cityName.name;
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? "С одной пересадкой" : "С двумя пересадками";
    } else {
        return "Без пересадок";
    }
};

const getDate = (date) => {
    return new Date(date).toLocaleString("ru", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const createCard = (data, container) => {
    const li = document.createElement("li");
    li.classList.add("ticket");
    let layout = `
    <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
        <div class="left-side">
            <a href="https://www.${
                data.gate
            }/search/SVX2905KGD1" class="button button__buy" target="_blank">Купить
                за ${data.value}₽</a>
        </div>
        <div class="right-side">
            <div class="block-left">
                <div class="city__from">Вылет из города
                    <span class="city__name">${getCityName(data.origin)}</span>
                </div>
                <div class="date">${getDate(data.depart_date)}</div>
            </div>

            <div class="block-right">
                <div class="changes">${getChanges(data.number_of_changes)}</div>
                <div class="city__to">Город назначения:
                    <span class="city__name">${getCityName(
                        data.destination
                    )}</span>
                </div>
            </div>
        </div>
    </div>
`;
    li.innerHTML = layout;
    container.append(li);
};

// Events >>
// From - input
inputCitiesFrom.addEventListener("input", () => {
    showCities(inputCitiesFrom, dropdownCitiesFrom);
});
// From - list
dropdownCitiesFrom.addEventListener("click", (e) => {
    selectCity(e, inputCitiesFrom, dropdownCitiesFrom);
});

// To - input
inputCitiesTo.addEventListener("input", () => {
    showCities(inputCitiesTo, dropdownCitiesTo);
});
// To - list
dropdownCitiesTo.addEventListener("click", (e) => {
    selectCity(e, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener("submit", (e) => {
    e.preventDefault();

    //Find obj cities
    const cityFrom = cities.find((item) => item.name === inputCitiesFrom.value);
    const cityTo = cities.find((item) => item.name === inputCitiesTo.value);

    //For request
    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value,
    };

    if (cityFrom && cityTo) {
        const requestData =
            `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}` +
            `&one_way=true&token=`;

        //Receiving data
        getData(calendarApi + requestData + API_KEY, (data) => {
            debugger;
            renderTickets(data, formData.when);
        });
    } else {
        alert("Введите корректные названия городов");
    }
});

getData(baseData, (data) => {
    cities = data;
    cities.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    });
});
