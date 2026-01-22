/* --- ChatBot.js CORRIGÉ --- */

// 1. CONFIGURATION
const API_KEY = "GEMINI_API_KEY"; 

const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

// 2. ÉLÉMENTS HTML
const btn = document.getElementById('sendBtn');
const input = document.getElementById('userInput');
const display = document.getElementById('responseContainer');

// 3. VARIABLES D'ÉTAT (MÉMOIRE)
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
        div.textContent = text; 
    } else {
        div.classList.add('ai-message');
        // Vérifie si "marked" est bien chargé, sinon affiche le texte brut
        if (typeof marked !== 'undefined') {
            div.innerHTML = marked.parse(text);
        } else {
            div.textContent = text;
        }
    }

    display.appendChild(div);
    display.scrollTop = display.scrollHeight;

    // Rendu MathJax si nécessaire
    if (sender === 'ai' && window.MathJax) {
        MathJax.typesetPromise([div]).catch((err) => console.log('Erreur MathJax:', err));
    }
}

// 5. FONCTION PRINCIPALE (INTELLIGENCE)
async function getGeminiResponse(userMessage) {
    // A. Afficher le message utilisateur
    appendMessage(userMessage, 'user');

    // B. Ajouter à l'historique
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    // C. Loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-bubble';
    loadingDiv.textContent = "IPS'IA réfléchit...";
    display.appendChild(loadingDiv);
    display.scrollTop = display.scrollHeight;

    try {
        // D. Appel API
        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        // Suppression du loading
        if(loadingDiv.parentNode) {
            display.removeChild(loadingDiv);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur API (${response.status}) : ${errorData.error.message}`);
        }

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // E. Afficher réponse IA
        appendMessage(aiText, 'ai');

        // F. Sauvegarder dans l'historique
        chatHistory.push({
            role: "model",
            parts: [{ text: aiText }]
        });

    } catch (error) {
        if(loadingDiv.parentNode) display.removeChild(loadingDiv);
        console.error("ERREUR:", error);
        appendMessage(`Une erreur est survenue : ${error.message}`, 'ai');
    }
}

// 6. GESTION DES ÉVÉNEMENTS
function sendMessage() {
    const message = input.value.trim();
    if (message !== "") {
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