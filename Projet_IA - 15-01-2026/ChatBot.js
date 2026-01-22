/* --- ChatBot.js VERSION STABLE (GEMINI PRO) --- */

// 1. CONFIGURATION API
const API_KEY = "GEMINI_API_KEY"; 

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
        display.innerHTML = `<p class="loading">IPS'IA réfléchit...</p>`;
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
        
        // Suppression du message "loading"
        display.innerHTML = ""; 

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            
            // ÉTAPE 1 : Conversion du Markdown (gras, listes) en HTML
            // On utilise la librairie "marked" qu'on a ajoutée dans le HTML
            const htmlContent = marked.parse(aiText);
            
            // Création de l'élément div pour le message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-message';
            messageDiv.innerHTML = htmlContent;
            
            display.appendChild(messageDiv);

            // ÉTAPE 2 : Rendu des mathématiques avec MathJax
            // On demande à MathJax de scanner le nouveau message pour transformer les $$...$$
            if (window.MathJax) {
                MathJax.typesetPromise([messageDiv]).then(() => {
                    console.log("Formules mathématiques rendues.");
                }).catch((err) => console.log('Erreur MathJax:', err));
            }

        } else {
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