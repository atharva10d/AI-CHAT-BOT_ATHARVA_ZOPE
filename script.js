// script.js
const apiKey = "AIzaSyBAf0sZ7P8e7gEB-BTA-vE-SFdruKnyu0g";
const body = document.body;
const container = document.querySelector('.container');
const chatTitle = document.getElementById('chatTitle');
const userInputField = document.getElementById('userInput');
const askButton = document.getElementById('askButton');
const responseDiv = document.getElementById('response');
const bulbIcon = document.getElementById('bulbIcon');
const wire = document.getElementById('wire');
const footerText = document.getElementById('footerText');
const historyTaskbar = document.getElementById('historyTaskbar');
const historyTitle = document.getElementById('historyTitle');
const historyList = document.getElementById('historyList');

let chatHistory = JSON.parse(localStorage.getItem('athuChatHistory') || '[]');
const maxHistoryLength = 10;

function applyTheme(themeName) {
    if (themeName === 'dark') {
        body.classList.add('dark-mode');
        container.classList.add('dark-mode');
        chatTitle.classList.add('dark-mode');
        userInputField.classList.add('dark-mode');
        askButton.classList.add('dark-mode');
        responseDiv.classList.add('dark-mode');
        footerText.classList.add('dark-mode-footer');
        wire.classList.add('dark-mode-wire');
        historyTaskbar.classList.add('dark-mode-history');
        historyTitle.classList.add('dark-mode-history-title');
        bulbIcon.classList.remove('light');
        bulbIcon.textContent = '☀';
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => item.classList.add('dark-mode-history-item'));
    } else {
        body.classList.remove('dark-mode');
        container.classList.remove('dark-mode');
        chatTitle.classList.remove('dark-mode');
        userInputField.classList.remove('dark-mode');
        askButton.classList.remove('dark-mode');
        responseDiv.classList.remove('dark-mode');
        footerText.classList.remove('dark-mode-footer');
        wire.classList.remove('dark-mode-wire');
        historyTaskbar.classList.remove('dark-mode-history');
        historyTitle.classList.remove('dark-mode-history-title');
        bulbIcon.classList.add('light');
        bulbIcon.textContent = '☁';
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => item.classList.remove('dark-mode-history-item'));
    }
    localStorage.setItem('theme', themeName);
}

function toggleDarkMode() {
    wire.classList.add('pull');
    setTimeout(() => {
        wire.classList.remove('pull');
        if (body.classList.contains('dark-mode')) {
            applyTheme('light');
        } else {
            applyTheme('dark');
        }
    }, 200);
}

function displayHistory() {
    historyList.innerHTML = '';
    chatHistory.forEach((question, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('history-item');
        if (body.classList.contains('dark-mode')) {
            listItem.classList.add('dark-mode-history-item');
        }
        listItem.textContent = question;
        listItem.addEventListener('click', () => {
            document.getElementById('userInput').value = question;
        });
        historyList.prepend(listItem);
    });
}

function updateHistory(question) {
    chatHistory.unshift(question);
    if (chatHistory.length > maxHistoryLength) {
        chatHistory = chatHistory.slice(0, maxHistoryLength);
    }
    localStorage.setItem('athuChatHistory', JSON.stringify(chatHistory));
    displayHistory();
}

const currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);
displayHistory();

async function askGemini() {
    const userInput = document.getElementById("userInput").value;
    const responseDiv = document.getElementById("response");

    if (!userInput) {
        responseDiv.innerHTML = "<b style='color:red;'>Please enter a question!</b>";
        return;
    }

    responseDiv.innerHTML = "Thinking... ⏳";
    updateHistory(userInput);

    try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userInput }] }]
            })
        });

        const data = await res.json();
        console.log("Raw API Response:", data);

        if (res.ok) {
            if (data.candidates && data.candidates.length > 0) {
                let responseText = data.candidates[0].content.parts[0].text;
                responseDiv.innerHTML = `<b>Response:</b>${responseText}`;
            } else {
                responseDiv.innerHTML = "<b style='color:red;'>No response from AI. (Empty response)</b>";
            }
        } else {
            responseDiv.innerHTML = `<b style='color:red;'>Error from AI API. Status: ${res.status} ${res.statusText}</b>`;
            console.error("API Error:", res.status, res.statusText, data);
        }


    } catch (error) {
        responseDiv.innerHTML = "<b style='color:red;'>Error fetching response. (Network issue?)</b>";
        console.error("Fetch Error:", error);
    }
}