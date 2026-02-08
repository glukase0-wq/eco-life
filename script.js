// ===============================
// ======= GLOBAL VARIABLES =======
// ===============================
const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_KEY"; // Replace with your key
const AI_API_KEY = "YOUR_OPENAI_KEY"; // Replace with your key
const weatherCard = document.getElementById("weather-climate");
const ecoTipEl = document.getElementById("eco-tip");
const discussionPosts = document.getElementById("discussion-posts");
const newPostInput = document.getElementById("new-post");
const postBtn = document.getElementById("post-btn");
const searchBar = document.getElementById("location-search");
const searchBtn = document.getElementById("search-btn");

// ===============================
// ====== SETTINGS PANEL =========
// ===============================
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsBtn = document.getElementById("close-settings");
const toggleTheme = document.getElementById("toggle-theme");
const toggleWeather = document.getElementById("toggle-weather");
const toggleTips = document.getElementById("toggle-tips");

settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("settings-open");
});
closeSettingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("settings-open");
});
toggleTheme.addEventListener("change", () => {
    document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme");
});
toggleWeather.addEventListener("change", () => {
    weatherCard.style.display = toggleWeather.checked ? "block" : "none";
});
toggleTips.addEventListener("change", () => {
    ecoTipEl.style.display = toggleTips.checked ? "block" : "none";
});

// ===============================
// ======== ECO TIPS =============
// ===============================
const ecoTipsArray = [
    "Plant native trees 🌳",
    "Reduce single-use plastics ♻️",
    "Collect rainwater 💧",
    "Use eco-friendly transport 🚶‍♂️",
    "Start a compost pile 🥕",
    "Save electricity 💡",
    "Protect local wildlife 🐾",
    "Participate in clean-ups 🧹",
    "Educate others about climate change 🌍"
];
function showEcoTip() {
    const tip = ecoTipsArray[Math.floor(Math.random() * ecoTipsArray.length)];
    ecoTipEl.innerText = "Eco Tip: " + tip;
}

// ===============================
// ======== WEATHER ===============
// ===============================
async function getWeather(city = "Nairobi") {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        const data = await res.json();
        document.getElementById("temperature").innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById("conditions").innerText = data.weather[0].description;
        document.getElementById("location").innerText = data.name + ", " + data.sys.country;
    } catch (err) {
        console.error(err);
        document.getElementById("conditions").innerText = "Unable to fetch weather";
    }
}
searchBtn.addEventListener("click", () => {
    const city = searchBar.value.trim() || "Nairobi";
    getWeather(city);
});

// ===============================
// ======== DATE & TIME ===========
// ===============================
function showDateTime() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById("date-time").innerText = now.toLocaleDateString(undefined, options);
}

// ===============================
// ======== DISCUSSIONS ===========
postBtn.addEventListener("click", () => {
    const text = newPostInput.value.trim();
    if(text){
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.innerText = "💡 " + text;
        discussionPosts.prepend(postDiv);
        newPostInput.value = "";
    }
});

// ===============================
// ======== TABS ==================
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

// ===============================
// ======== AI CHAT ==============
async function askAI(question) {
    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{role: "user", content: question}],
                temperature: 0.7
            })
        });
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error(err);
        return "Sorry, I cannot fetch advice at the moment.";
    }
}

// Example AI assistant interaction
const aiInput = document.getElementById("ai-input");
const aiBtn = document.getElementById("ai-btn");
const aiOutput = document.getElementById("ai-output");

if(aiBtn){
    aiBtn.addEventListener("click", async () => {
        const question = aiInput.value.trim();
        if(question){
            aiOutput.innerText = "Thinking...";
            const answer = await askAI(question);
            aiOutput.innerText = answer;
        }
    });
}

// ===============================
// ======== LEAFLET MAP ===========
let map = L.map('map').setView([-1.286389, 36.817223], 6); // Center on Kenya
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample dynamic markers
const markersData = [
    {
        coords: [-1.2921, 36.8219],
        title: "Sustainable Farming",
        topic: "farming"
    },
    {
        coords: [-0.0236, 37.9062],
        title: "Tree Planting Zone",
        topic: "trees"
    },
    {
        coords: [-3.3869, 36.6822],
        title: "Water Conservation Project",
        topic: "water"
    }
];

markersData.forEach(async (m) => {
    const marker = L.marker(m.coords).addTo(map);
    marker.on('click', async () => {
        // Example: Fetch content from AI for marker
        const tips = await askAI(`Give me practical tips about ${m.title} in Kenya`);
        marker.bindPopup(`
            <h3>${m.title}</h3>
            <p>${tips}</p>
            <img src="https://source.unsplash.com/400x200/?${m.topic}" alt="${m.title}" style="width:100%;border-radius:8px;">
        `).openPopup();
    });
});

// ===============================
// ======== SCROLL HIDE SEARCH ===
// ===============================
let lastScrollTop = 0;
window.addEventListener("scroll", () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if(st > lastScrollTop){ // scrolling down
        searchBar.style.top = "-60px";
    } else { // scrolling up
        searchBar.style.top = "10px";
    }
    lastScrollTop = st <= 0 ? 0 : st;
});

// ===============================
// ======== INITIALIZE ===========
window.addEventListener("DOMContentLoaded", () => {
    showEcoTip();
    showDateTime();
    getWeather();
    setInterval(showEcoTip, 60000);
    setInterval(showDateTime, 60000);
});
