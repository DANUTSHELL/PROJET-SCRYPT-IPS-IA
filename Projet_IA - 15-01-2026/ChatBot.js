/* --- ChatBot.js VERSION STABLE (GEMINI PRO) --- */

// 1. CONFIGURATION API
const API_KEY = "AIzaSyA_4ErBEbqU-sX4sZIcZAw5OoBg_izhdxA"; 

// CHANGEMENT ICI : On utilise le modèle 'gemini-pro' qui est le plus compatible
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
// 2. ÉLÉMENTS HTML
const btn = document.getElementById('sendBtn');
const input = document.getElementById('userInput');
const display = document.getElementById('responseContainer');

// 3. FONCTION INTELLIGENTE
async function getGeminiResponse(prompt) {
    if (!display) return;

    try {
        display.innerHTML = `<p class="loading">Dom'IA réfléchit...</p>`;
        console.log("Envoi du prompt vers Gemini Pro...");

        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur ${response.status} : ${errorData.error.message}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            const formattedText = aiText.replace(/\n/g, '<br>');
            display.innerHTML = `<p class="ai-message">${formattedText}</p>`;
        } 
        else {
            display.innerHTML = `<p>Réponse vide de l'IA.</p>`;
        }

    } catch (error) {
        console.error("ERREUR :", error);
        display.innerHTML = `
            <div class="error-card">
                <strong>Erreur :</strong> ${error.message}<br><br>
                Si l'erreur persiste, vérifiez que l'API "Generative Language API" est bien activée dans la console Google Cloud.
            </div>`;
    }
}

// 4. GESTION DES ÉVÉNEMENTS
function sendMessage() {
    const message = input.value;
    if (message.trim() !== "") {
        getGeminiResponse(message);
        input.value = "";
    }
}

if (btn && input) {
    btn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}