/* --- ChatBot.js VERSION V2 (Mémoire + Chat UI) --- */

// 1. CONFIGURATION
const API_KEY = "VOTRE_API_KEY_ICI"; // ⚠️ Remettez votre clé ici !
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// 2. ÉLÉMENTS HTML
const btn = document.getElementById('sendBtn');
const input = document.getElementById('userInput');
const display = document.getElementById('responseContainer');

// 3. VARIABLES D'ÉTAT (MÉMOIRE)
// On initialise l'historique avec une instruction système pour donner une personnalité à l'IA
let chatHistory = [
    {
        role: "user",
        parts: [{ text: "Tu es IPS'IA, un assistant pédagogique utile, amical et expert en sciences pour une école d'ingénieurs. Utilise le format LaTeX pour les formules mathématiques." }]
    },
    {
        role: "model",
        parts: [{ text: "Compris ! Je suis prêt à aider les étudiants." }]
    }
];

// 4. FONCTION D'AFFICHAGE DES MESSAGES
function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message-bubble');
    
    if (sender === 'user') {
        div.classList.add('user-message');
        div.textContent = text; // Pas de markdown pour l'user, texte brut
    } else {
        div.classList.add('ai-message');
        // Conversion Markdown -> HTML
        div.innerHTML = marked.parse(text); 
    }

    display.appendChild(div);
    
    // Scroll automatique vers le bas pour voir le dernier message
    display.scrollTop = display.scrollHeight;

    // Si c'est l'IA, on active MathJax sur ce nouveau message
    if (sender === 'ai' && window.MathJax) {
        MathJax.typesetPromise([div]).catch((err) => console.log(err));
    }
}

// 5. FONCTION PRINCIPALE (INTELLIGENCE)
async function getGeminiResponse(userMessage) {
    // A. Afficher le message de l'utilisateur
    appendMessage(userMessage, 'user');

    // B. Ajouter le message de l'utilisateur à l'historique (mémoire)
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    // C. Afficher une bulle de chargement temporaire
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-bubble';
    loadingDiv.textContent = "IPS'IA réfléchit...";
    display.appendChild(loadingDiv);
    display.scrollTop = display.scrollHeight;

    try {
        // D. Appel API avec TOUT l'historique
        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: chatHistory
            })
        });

        // Suppression du message de chargement
        display.removeChild(loadingDiv);

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // E. Afficher la réponse de l'IA
        appendMessage(aiText, 'ai');

        // F. Ajouter la réponse de l'IA à l'historique (pour le prochain tour)
        chatHistory.push({
            role: "model",
            parts: [{ text: aiText }]
        });

    } catch (error) {
        display.removeChild(loadingDiv); // Enlever le loading même en cas d'erreur
        console.error("Erreur:", error);
        appendMessage("Oups, une erreur est survenue. Vérifiez la console (F12).", 'ai');
    }
}

// 6. GESTION DES ÉVÉNEMENTS
function sendMessage() {
    const message = input.value.trim();
    if (message !== "") {
        // Au premier message, on efface le message de bienvenue par défaut s'il est là
        const greeting = document.querySelector('.greeting');
        if (greeting) greeting.style.display = 'none';

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