/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Function to handle particle animation
const initParticles = () => {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer)
        return;
    // Create a document fragment to improve performance
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        fragment.appendChild(particle);
    }
    particlesContainer.appendChild(fragment);
};
// Function to handle navbar scroll effect
const handleNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
        else {
            navbar.classList.remove('scrolled');
        }
    }
};
// Function to set up the mobile menu toggle
const setupMobileMenu = () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
};
// Function for smooth scrolling
const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href)
                return;
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu on link click
                const navLinks = document.getElementById('navLinks');
                const menuToggle = document.getElementById('menuToggle');
                if (navLinks?.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle?.classList.remove('active');
                }
            }
        });
    });
};
// Function to set up intersection observer for animations
const setupIntersectionObserver = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
                observer.unobserve(target); // Stop observing after animation for performance
            }
        });
    }, observerOptions);
    document.querySelectorAll('.service-card, .crypto-card, .stat-card').forEach(el => {
        const element = el;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
};
// Function to handle wallet connect button
const setupWalletButton = () => {
    const walletBtn = document.querySelector('.wallet-btn');
    if (walletBtn) {
        const originalContent = walletBtn.innerHTML;
        walletBtn.addEventListener('click', function () {
            this.innerHTML = '<span class="loading"></span> Verbinde...';
            this.disabled = true;
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
                alert('Wallet-Integration wird in Kürze verfügbar sein!');
            }, 2000);
        });
    }
};
// Function to simulate live crypto prices
const simulateCryptoPrices = () => {
    const priceElements = document.querySelectorAll('.price-change');
    if (priceElements.length === 0)
        return;
    const updatePrices = () => {
        priceElements.forEach(el => {
            const change = (Math.random() - 0.5) * 5;
            el.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            el.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
        });
    };
    updatePrices(); // Initial update
    setInterval(updatePrices, 5000);
};
// Function to handle locked service card clicks
const setupServiceCardClicks = () => {
    document.querySelectorAll('.service-card:not(#ai-chat-card):not(#image-gen-card):not(#data-analysis-card):not(#translation-card):not(#audio-processing-card):not(#code-assistant-card)').forEach(card => {
        card.addEventListener('click', function () {
            const locked = this.querySelector('.service-locked');
            if (locked) {
                locked.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    alert('Bitte verbinden Sie Ihre Wallet und bezahlen Sie mit Krypto, um diesen Service freizuschalten.');
                    locked.style.animation = '';
                }, 500);
            }
        });
    });
};
// Function to set up and manage the AI Chat Assistant
const setupAiChat = () => {
    const modalOverlay = document.getElementById('aiChatModal');
    const aiChatCard = document.getElementById('ai-chat-card');
    const closeButton = document.getElementById('closeChatModal');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    if (!modalOverlay || !aiChatCard || !closeButton || !chatForm || !chatInput || !chatMessages)
        return;
    let chatHistory = [];
    let thinking = false;
    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        if (sender === 'thinking') {
            messageElement.innerHTML = `<span></span><span></span><span></span>`;
        }
        else {
            messageElement.textContent = text;
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    const setThinking = (isThinking) => {
        if (isThinking && !thinking) {
            addMessage('', 'thinking');
        }
        else if (!isThinking && thinking) {
            const thinkingMessage = chatMessages.querySelector('.thinking');
            if (thinkingMessage) {
                thinkingMessage.remove();
            }
        }
        thinking = isThinking;
    };
    const openModal = () => {
        modalOverlay.classList.add('visible');
        chatInput.focus();
        addMessage("Hallo! Wie kann ich dir heute helfen, die Welt von AI und Krypto zu erkunden?", 'ai');
    };
    const closeModal = () => {
        modalOverlay.classList.remove('visible');
        chatMessages.innerHTML = ''; // Clear chat history
        chatHistory = [];
    };
    aiChatCard.addEventListener('click', () => {
        const lockedIcon = aiChatCard.querySelector('.service-locked');
        if (lockedIcon) {
            lockedIcon.style.opacity = '0';
            setTimeout(() => {
                lockedIcon.remove();
            }, 300);
        }
        setTimeout(openModal, 150);
    });
    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput || thinking)
            return;
        addMessage(userInput, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
        chatInput.value = '';
        setThinking(true);
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'chat',
                    payload: { history: chatHistory.slice(0, -1), message: userInput }
                })
            });
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const data = await response.json();
            setThinking(false);
            addMessage(data.text, 'ai');
            chatHistory.push({ role: 'model', parts: [{ text: data.text }] });
        }
        catch (error) {
            console.error("Error sending message:", error);
            setThinking(false);
            addMessage("Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.", 'ai');
        }
    });
};
// Function to set up and manage the AI Image Editor
const setupImageGeneration = () => {
    const modal = document.getElementById('imageGenModal');
    const card = document.getElementById('image-gen-card');
    const closeButton = document.getElementById('closeImageGenModal');
    const form = document.getElementById('imageGenForm');
    const input = document.getElementById('imageGenInput');
    const submitButton = form.querySelector('button[type="submit"]');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imageResult = document.getElementById('imageResult');
    const resultPlaceholder = document.getElementById('resultPlaceholder');
    const loadingOverlay = document.querySelector('.image-result-container .loading-overlay');
    if (!modal || !card || !closeButton || !form || !input || !submitButton || !imageUpload || !imagePreview || !uploadPlaceholder || !imageResult || !resultPlaceholder || !loadingOverlay)
        return;
    let uploadedImageData = null;
    const openModal = () => {
        modal.classList.add('visible');
    };
    const closeModal = () => {
        modal.classList.remove('visible');
        // Reset state on close
        uploadedImageData = null;
        imageUpload.value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'flex';
        imageResult.src = '';
        imageResult.style.display = 'none';
        resultPlaceholder.style.display = 'block';
        input.value = '';
        input.disabled = true;
        submitButton.disabled = true;
    };
    card.addEventListener('click', () => {
        const lockedIcon = card.querySelector('.service-locked');
        if (lockedIcon) {
            lockedIcon.style.opacity = '0';
            setTimeout(() => {
                lockedIcon.remove();
            }, 300);
        }
        setTimeout(openModal, 150);
    });
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            imagePreview.src = result;
            imagePreview.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            const [header, base64] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && base64) {
                uploadedImageData = { mimeType, data: base64 };
                input.disabled = false;
                submitButton.disabled = false;
                input.focus();
            }
            else {
                alert("Konnte Bild nicht verarbeiten. Bitte versuche ein anderes Format (JPEG, PNG).");
                closeModal();
            }
        };
        reader.readAsDataURL(file);
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = input.value.trim();
        if (!prompt || !uploadedImageData)
            return;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        input.disabled = true;
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'image-edit',
                    payload: { image: uploadedImageData, prompt }
                })
            });
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const data = await response.json();
            if (data.image) {
                const { mimeType, data: imageData } = data.image;
                imageResult.src = `data:${mimeType};base64,${imageData}`;
                imageResult.style.display = 'block';
                resultPlaceholder.style.display = 'none';
            }
            else {
                alert("Die KI konnte kein Bild generieren. Versuche eine andere Anweisung.");
            }
        }
        catch (error) {
            console.error("Error generating image:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
        }
        finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            input.disabled = false;
        }
    });
};
// Function to set up and manage the AI Data Analysis
const setupDataAnalysis = () => {
    const modal = document.getElementById('dataAnalysisModal');
    const card = document.getElementById('data-analysis-card');
    const closeButton = document.getElementById('closeDataAnalysisModal');
    const form = document.getElementById('dataAnalysisForm');
    const input = document.getElementById('dataAnalysisInput');
    const submitButton = form.querySelector('button[type="submit"]');
    const resultContainer = document.getElementById('dataAnalysisResult');
    const placeholder = document.getElementById('dataAnalysisPlaceholder');
    const loadingOverlay = document.querySelector('#dataAnalysisBody .loading-overlay');
    if (!modal || !card || !closeButton || !form || !input || !submitButton || !resultContainer || !placeholder || !loadingOverlay)
        return;
    const openModal = () => {
        modal.classList.add('visible');
        input.focus();
    };
    const closeModal = () => {
        modal.classList.remove('visible');
        input.value = '';
        resultContainer.innerHTML = '';
        resultContainer.style.display = 'none';
        placeholder.style.display = 'block';
    };
    card.addEventListener('click', () => {
        const lockedIcon = card.querySelector('.service-locked');
        if (lockedIcon) {
            lockedIcon.style.opacity = '0';
            setTimeout(() => {
                lockedIcon.remove();
            }, 300);
        }
        setTimeout(openModal, 150);
    });
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = (input.scrollHeight) + 'px';
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = input.value.trim();
        if (!description)
            return;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        input.disabled = true;
        placeholder.style.display = 'none';
        resultContainer.style.display = 'none';
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'data-analysis',
                    payload: { description }
                })
            });
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const result = await response.json();
            resultContainer.innerHTML = `
                <h3>${result.title}</h3>
                <p>${result.summary}</p>
                <div class="analysis-section">
                    <h4>Schlüsselerkenntnisse</h4>
                    <ul>${result.key_insights.map((item) => `<li>${item}</li>`).join('')}</ul>
                </div>
                <div class="analysis-section">
                    <h4>Handlungsempfehlungen</h4>
                    <ul>${result.recommendations.map((item) => `<li>${item}</li>`).join('')}</ul>
                </div>
            `;
            resultContainer.style.display = 'flex';
        }
        catch (error) {
            console.error("Error during data analysis:", error);
            placeholder.style.display = 'block';
            placeholder.textContent = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        }
        finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            input.disabled = false;
        }
    });
};
// Function to set up and manage the AI Translation service
const setupTranslation = () => {
    const modal = document.getElementById('translationModal');
    const card = document.getElementById('translation-card');
    const closeButton = document.getElementById('closeTranslationModal');
    const form = document.getElementById('translationForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const loadingOverlay = document.querySelector('#translationBody .loading-overlay');
    if (!modal || !card || !closeButton || !form || !submitButton || !sourceLang || !targetLang || !sourceText || !targetText || !loadingOverlay)
        return;
    const openModal = () => {
        modal.classList.add('visible');
        sourceText.focus();
    };
    const closeModal = () => {
        modal.classList.remove('visible');
        sourceText.value = '';
        targetText.value = '';
    };
    card.addEventListener('click', () => {
        const lockedIcon = card.querySelector('.service-locked');
        if (lockedIcon) {
            lockedIcon.style.opacity = '0';
            setTimeout(() => {
                lockedIcon.remove();
            }, 300);
        }
        setTimeout(openModal, 150);
    });
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textToTranslate = sourceText.value.trim();
        const fromLang = sourceLang.value;
        const toLang = targetLang.value;
        if (!textToTranslate)
            return;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        sourceText.disabled = true;
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'translate',
                    payload: { text: textToTranslate, from: fromLang, to: toLang }
                })
            });
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const data = await response.json();
            targetText.value = data.text;
        }
        catch (error) {
            console.error("Error during translation:", error);
            targetText.value = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        }
        finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            sourceText.disabled = false;
        }
    });
};
// Function to set up and manage the AI Audio Processing service
const setupAudioProcessing = () => {
    const modal = document.getElementById('audioProcessingModal');
    const card = document.getElementById('audio-processing-card');
    const closeButton = document.getElementById('closeAudioModal');
    const form = document.getElementById('audioProcessingForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const audioUpload = document.getElementById('audioUpload');
    const transcriptionResult = document.getElementById('transcriptionResult');
    const loadingOverlay = document.querySelector('#audioProcessingBody .loading-overlay');
    const audioFileName = document.getElementById('audioFileName');
    if (!modal || !card || !closeButton || !form || !submitButton || !audioUpload || !transcriptionResult || !loadingOverlay || !audioFileName)
        return;
    let uploadedAudioData = null;
    const openModal = () => {
        modal.classList.add('visible');
    };
    const closeModal = () => {
        modal.classList.remove('visible');
        uploadedAudioData = null;
        audioUpload.value = '';
        transcriptionResult.value = '';
        audioFileName.textContent = '';
        submitButton.disabled = true;
    };
    card.addEventListener('click', () => {
        const lockedIcon = card.querySelector('.service-locked');
        if (lockedIcon) {
            lockedIcon.style.opacity = '0';
            setTimeout(() => {
                lockedIcon.remove();
            }, 300);
        }
        setTimeout(openModal, 150);
    });
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    audioUpload.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            const [header, base64] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && base64) {
                uploadedAudioData = { mimeType, data: base64 };
                submitButton.disabled = false;
                audioFileName.textContent = file.name;
            }
            else {
                alert("Konnte Audiodatei nicht verarbeiten. Bitte versuche ein anderes Format (MP3, WAV, etc.).");
                closeModal();
            }
        };
        reader.readAsDataURL(file);
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!uploadedAudioData)
            return;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'audio-transcribe',
                    payload: { audio: uploadedAudioData }
                })
            });
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const data = await response.json();
            transcriptionResult.value = data.text;
        }
        catch (error) {
            console.error("Error during transcription:", error);
            transcriptionResult.value = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        }
        finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
        }
    });
};
// Function to set up and manage the AI Code Assistant
const setupCodeAssistant = () => {
    const modal = document.getElementById('codeAssistantModal');
    const card = document.getElementById('code-assistant-card');
    const closeButton = document.getElementById('closeCodeAssistantModal');
    const form = document.getElementById('codeAssistantForm');
    const input = document.getElementById('codeAssistantInput');
    const languageSelect = document.getElementById('codeLanguage');
    const submitButton = form.querySelector('button[type="submit"]');
    const resultContainer = document.getElementById('codeResultContainer');
    const codeResult = document.getElementById('codeResult');
    const placeholder = document.getElementById('codeAssistantPlaceholder');
    const loadingOverlay = document.querySelector('#codeAssistantBody .loading-overlay');
    if (!modal || !card || !closeButton || !form || !input || !languageSelect || !submitButton || !resultContainer || !codeResult || !placeholder || !loadingOverlay)
        return;
    const openModal = () => {
        modal.classList.add('visible');
        input.focus();
    };
    const closeModal = () => {
        modal.classList.remove('visible');
        input.value = '';
        codeResult.textContent = '';
        resultContainer.style.display = 'none';
        placeholder.style.display = 'block';
    };
    card.addEventListener('click', () => {
        const lockedIcon = card.querySelector('.service-locked');
        if (lockedIcon) {
            lockedIcon.style.opacity = '0';
            setTimeout(() => {
                lockedIcon.remove();
            }, 300);
        }
        setTimeout(openModal, 150);
    });
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = (input.scrollHeight) + 'px';
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = input.value.trim();
        const language = languageSelect.value;
        if (!description)
            return;
        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        input.disabled = true;
        placeholder.style.display = 'none';
        resultContainer.style.display = 'none';
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task: 'code-assist',
                    payload: { description, language }
                })
            });
            if (!response.ok) {
                throw new Error('API request failed');
            }
            const data = await response.json();
            codeResult.textContent = data.text;
            resultContainer.style.display = 'block';
        }
        catch (error) {
            console.error("Error during code generation:", error);
            placeholder.style.display = 'block';
            placeholder.textContent = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        }
        finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            input.disabled = false;
        }
    });
};
// Main function to initialize all scripts
const main = () => {
    initParticles();
    handleNavbarScroll(); // Initial check
    setupMobileMenu();
    setupSmoothScrolling();
    setupIntersectionObserver();
    setupWalletButton();
    simulateCryptoPrices();
    setupServiceCardClicks();
    setupAiChat();
    setupImageGeneration();
    setupDataAnalysis();
    setupTranslation();
    setupAudioProcessing();
    setupCodeAssistant();
    window.addEventListener('scroll', handleNavbarScroll);
};
// Wait for the DOM to be fully loaded before running the scripts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
}
else {
    main();
}

// Fix: Add export to treat file as a module and prevent global scope conflicts.
export {};
