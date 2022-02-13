var loading_bar = new Nanobar();
createElements();
FIRST_TIME_LOAD = true;
fetchAndStart();
loading_bar.go(100);
console.log("why are you here leave")


// Functions
function updateDocumentWithNewData(current_period, current_day, time_left) {
    document.getElementById("current_period").innerHTML = (
        current_period
    );
    document.getElementById("current_day").innerHTML = (
        current_day
    );
    document.getElementById("timer-countdown").innerHTML = (
        time_left
    );
}

function setCircleDasharray(timeLeft, timeLimit) {
    const circleDasharray = `${((timeLeft / timeLimit) * 283)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}


function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (let i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

function format_string(string) {
    string = titleCase(string)
    string = string.replace(/_/g," ");
    return string
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

function fetchAndStart() {
    fetch("https://period-api.soosbot.com/api")
        .then(response => response.json())
        .then(data => {
            if (data.day_type == "EVEN_DAY") {
                document.getElementById("stingers").classList.remove("invisible");
                document.getElementById("stinger_one").innerHTML = format_string(data.stingers.one)
                document.getElementById("stinger_two").innerHTML = format_string(data.stingers.two)
            } else {
                document.getElementById("stingers").classList.add("invisible");
            }


            if (data.WEEKEND) {
                window.location = "/weekend.html"
            }
            if (FIRST_TIME_LOAD) {
                updateDocumentWithNewData(
                    format_string(data.period_type),
                    format_string(data.day_type),
                    formatTime(data.time_left)
                )
                FIRST_TIME_LOAD = false;
                startTimer(data);
            } else if (!FIRST_TIME_LOAD) {
                startTimer(data);
                setTimeout(() => {
                    document.getElementById("current_period").innerHTML = (
                        format_string(data.period_type)
                    );
                    document.getElementById("current_day").innerHTML = (
                        format_string(data.day_type)
                    );
                }, 1000);
            }
        });
}

function onTimesUp (timerInterval) {
    document.getElementById("timer-countdown").innerHTML = "0:00"
    clearInterval(timerInterval)
    // Wait 2 seconds before fetching new data. This because im lazy to fix the bug with the api..
    setTimeout(fetchAndStart, 2000);
}

function updateTimerColors(secondsLeft, totalTime) {
    let fraction = secondsLeft / totalTime;
    if (fraction < 0.10) {
        // Set the color to red
        document.getElementById("base-timer-path-remaining").style.stroke = "red";
        document.getElementById("base-timer-path-remaining").style.filter = "drop-shadow(0 0 0.75rem rgba(255, 0, 0, 0.336))";
    } else if(fraction < 0.30 ) {
        // Set the color to orange
        document.getElementById("base-timer-path-remaining").style.stroke = "orange";
        document.getElementById("base-timer-path-remaining").style.filter = "drop-shadow(0 0 0.75rem rgba(255, 166, 0, 0.336))";

    } else {
        // Set the color to green
        document.getElementById("base-timer-path-remaining").style.stroke = "rgb(0, 255, 140)";
        document.getElementById("base-timer-path-remaining").style.filter = "drop-shadow(0 0 0.75rem #00ff8c6b);";

    }
}

function startTimer(data) {
    let timeLimit = data.total_time;
    let timePassed = data.total_time - data.time_left;
    let timeLeft = timeLimit - timePassed;
    let timerInterval = setInterval(() => {
        timePassed++;
        timeLeft = timeLimit - timePassed;
        document.getElementById("timer-countdown").innerHTML = formatTime(
            timeLeft
        );
        if (timeLeft <= 0) {
            document.getElementById("timer-countdown").innerHTML = "0:00"
            onTimesUp(timerInterval)
        }
        updateTimerColors(timeLeft, timeLimit)
        setCircleDasharray(timeLeft, timeLimit);
    }, 1000)

}

function createElements() {
    document.getElementById("timer").innerHTML = `
        <div class="base-timer">
        <svg class="base-timer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g class="base-timer-circle">
            <circle class="base-timer-path-elapsed" cx="50" cy="50" r="45"></circle>
            <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer-path-remaining"
            d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
            "
            ></path>
          </g>
        </svg>
        <span id="timer-countdown" class="timer-countdown"></span>
        <h1 id="current_day"></h1>
        <p id="current_period"></p>
        </div>`;
}
