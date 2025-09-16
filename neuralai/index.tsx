/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";

// Function to handle particle animation
const initParticles = () => {
    const particlesContainer = document.querySelector('.particles') as HTMLElement;
    if (!particlesContainer) return;

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
        } else {
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
            if (!href) return;

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
    const observerOptions: IntersectionObserverInit = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
                observer.unobserve(target); // Stop observing after animation for performance
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .crypto-card, .stat-card').forEach(el => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
};

// Function to handle wallet connect button
const setupWalletButton = () => {
    const walletBtn = document.querySelector('.wallet-btn') as HTMLButtonElement;
    if (walletBtn) {
        const originalContent = walletBtn.innerHTML;
        walletBtn.addEventListener('click', function() {
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
    if(priceElements.length === 0) return;

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
        card.addEventListener('click', function() {
            const locked = this.querySelector('.service-locked') as HTMLElement;
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
    const modalOverlay = document.getElementById('aiChatModal') as HTMLElement;
    const aiChatCard = document.getElementById('ai-chat-card') as HTMLElement;
    const closeButton = document.getElementById('closeChatModal') as HTMLButtonElement;
    const chatForm = document.getElementById('chatForm') as HTMLFormElement;
    const chatInput = document.getElementById('chatInput') as HTMLInputElement;
    const chatMessages = document.getElementById('chatMessages') as HTMLElement;

    if (!modalOverlay || !aiChatCard || !closeButton || !chatForm || !chatInput || !chatMessages) return;

    let chat: Chat | null = null;
    let thinking = false;

    const addMessage = (text: string, sender: 'user' | 'ai' | 'thinking' | 'error') => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        
        if (sender === 'thinking') {
            messageElement.innerHTML = `<span></span><span></span><span></span>`;
        } else {
            messageElement.textContent = text;
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const setThinking = (isThinking: boolean) => {
        if (isThinking && !thinking) {
            addMessage('', 'thinking');
        } else if (!isThinking && thinking) {
            const thinkingMessage = chatMessages.querySelector('.thinking');
            if (thinkingMessage) {
                thinkingMessage.remove();
            }
        }
        thinking = isThinking;
    };

    const openModal = async () => {
        modalOverlay.classList.add('visible');
        chatInput.focus();
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chat = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: {
                systemInstruction: 'You are a helpful and friendly AI assistant for NeuralPay, a platform that provides AI services through crypto payments. Keep your answers concise and friendly.',
              },
            });
            addMessage("Hallo! Wie kann ich dir heute helfen, die Welt von AI und Krypto zu erkunden?", 'ai');
        } catch (error) {
            console.error("Error initializing Gemini:", error);
            addMessage("Entschuldigung, der AI-Assistent ist im Moment nicht verfügbar.", 'ai');
        }
    };

    const closeModal = () => {
        modalOverlay.classList.remove('visible');
        chatMessages.innerHTML = ''; // Clear chat history
        chat = null;
    };

    aiChatCard.addEventListener('click', () => {
        const lockedIcon = aiChatCard.querySelector('.service-locked') as HTMLElement;
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
        if (!userInput || !chat || thinking) return;

        addMessage(userInput, 'user');
        chatInput.value = '';
        setThinking(true);
        
        try {
            const response = await chat.sendMessage({ message: userInput });
            setThinking(false);
            addMessage(response.text, 'ai');
        } catch(error) {
            console.error("Error sending message:", error);
            setThinking(false);
            addMessage("Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.", 'ai');
        }
    });
};


// Function to set up and manage the AI Image Editor
const setupImageGeneration = () => {
    const modal = document.getElementById('imageGenModal') as HTMLElement;
    const card = document.getElementById('image-gen-card') as HTMLElement;
    const closeButton = document.getElementById('closeImageGenModal') as HTMLButtonElement;
    const form = document.getElementById('imageGenForm') as HTMLFormElement;
    const input = document.getElementById('imageGenInput') as HTMLInputElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
    const imagePreview = document.getElementById('imagePreview') as HTMLImageElement;
    const uploadPlaceholder = document.getElementById('uploadPlaceholder') as HTMLElement;
    const imageResult = document.getElementById('imageResult') as HTMLImageElement;
    const resultPlaceholder = document.getElementById('resultPlaceholder') as HTMLElement;
    const loadingOverlay = document.querySelector('.image-result-container .loading-overlay') as HTMLElement;

    if (!modal || !card || !closeButton || !form || !input || !submitButton || !imageUpload || !imagePreview || !uploadPlaceholder || !imageResult || !resultPlaceholder || !loadingOverlay) return;
    
    let uploadedImageData: { mimeType: string; data: string } | null = null;
    let ai: GoogleGenAI | null = null;
    
    const openModal = () => {
        modal.classList.add('visible');
        if (!ai) {
             ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
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
        const lockedIcon = card.querySelector('.service-locked') as HTMLElement;
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
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
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
            } else {
                 alert("Konnte Bild nicht verarbeiten. Bitte versuche ein anderes Format (JPEG, PNG).");
                 closeModal();
            }
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = input.value.trim();
        if (!prompt || !uploadedImageData || !ai) return;

        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        input.disabled = true;

        try {
            const imagePart = { inlineData: uploadedImageData };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            let foundImage = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const { mimeType, data } = part.inlineData;
                    imageResult.src = `data:${mimeType};base64,${data}`;
                    imageResult.style.display = 'block';
                    resultPlaceholder.style.display = 'none';
                    foundImage = true;
                    break;
                }
            }
            if (!foundImage) {
                alert("Die KI konnte kein Bild generieren. Versuche eine andere Anweisung.");
            }

        } catch (error) {
            console.error("Error generating image:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
        } finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            input.disabled = false;
        }
    });
};

// Function to set up and manage the AI Data Analysis
const setupDataAnalysis = () => {
    const modal = document.getElementById('dataAnalysisModal') as HTMLElement;
    const card = document.getElementById('data-analysis-card') as HTMLElement;
    const closeButton = document.getElementById('closeDataAnalysisModal') as HTMLButtonElement;
    const form = document.getElementById('dataAnalysisForm') as HTMLFormElement;
    const input = document.getElementById('dataAnalysisInput') as HTMLTextAreaElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const resultContainer = document.getElementById('dataAnalysisResult') as HTMLElement;
    const placeholder = document.getElementById('dataAnalysisPlaceholder') as HTMLElement;
    const loadingOverlay = document.querySelector('#dataAnalysisBody .loading-overlay') as HTMLElement;

    if (!modal || !card || !closeButton || !form || !input || !submitButton || !resultContainer || !placeholder || !loadingOverlay) return;

    let ai: GoogleGenAI | null = null;

    const openModal = () => {
        modal.classList.add('visible');
        if (!ai) {
             ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
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
        const lockedIcon = card.querySelector('.service-locked') as HTMLElement;
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
        if (!description || !ai) return;

        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        input.disabled = true;
        placeholder.style.display = 'none';
        resultContainer.style.display = 'none';

        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Ein kurzer, prägnanter Titel für die Analyse." },
                summary: { type: Type.STRING, description: "Eine Zusammenfassung der Analyse in 2-3 Sätzen." },
                key_insights: {
                    type: Type.ARRAY,
                    description: "Eine Liste von 3-5 wichtigen Erkenntnissen aus den Daten.",
                    items: { type: Type.STRING }
                },
                recommendations: {
                    type: Type.ARRAY,
                    description: "Eine Liste von 2-3 umsetzbaren Empfehlungen basierend auf der Analyse.",
                    items: { type: Type.STRING }
                }
            }
        };

        try {
            const prompt = `Du bist ein erfahrener Datenanalyst. Basierend auf der folgenden Beschreibung, generiere ein plausibles, fiktives Datenset in deinem Gedächtnis (zeige es nicht an). Analysiere dieses Datenset und gib einen Titel, eine Zusammenfassung, 3-5 Schlüsselerkenntnisse und 2-3 Handlungsempfehlungen zurück. Die Beschreibung des Nutzers ist: "${description}". Formatiere deine Antwort ausschließlich als JSON gemäß dem vorgegebenen Schema.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });

            const result = JSON.parse(response.text);

            resultContainer.innerHTML = `
                <h3>${result.title}</h3>
                <p>${result.summary}</p>
                <div class="analysis-section">
                    <h4>Schlüsselerkenntnisse</h4>
                    <ul>${result.key_insights.map((item: string) => `<li>${item}</li>`).join('')}</ul>
                </div>
                <div class="analysis-section">
                    <h4>Handlungsempfehlungen</h4>
                    <ul>${result.recommendations.map((item: string) => `<li>${item}</li>`).join('')}</ul>
                </div>
            `;
            resultContainer.style.display = 'flex';

        } catch (error) {
            console.error("Error during data analysis:", error);
            placeholder.style.display = 'block';
            placeholder.textContent = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        } finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            input.disabled = false;
        }
    });
};

// Function to set up and manage the AI Translation service
const setupTranslation = () => {
    const modal = document.getElementById('translationModal') as HTMLElement;
    const card = document.getElementById('translation-card') as HTMLElement;
    const closeButton = document.getElementById('closeTranslationModal') as HTMLButtonElement;
    const form = document.getElementById('translationForm') as HTMLFormElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const sourceLang = document.getElementById('sourceLang') as HTMLSelectElement;
    const targetLang = document.getElementById('targetLang') as HTMLSelectElement;
    const sourceText = document.getElementById('sourceText') as HTMLTextAreaElement;
    const targetText = document.getElementById('targetText') as HTMLTextAreaElement;
    const loadingOverlay = document.querySelector('#translationBody .loading-overlay') as HTMLElement;

    if (!modal || !card || !closeButton || !form || !submitButton || !sourceLang || !targetLang || !sourceText || !targetText || !loadingOverlay) return;

    let ai: GoogleGenAI | null = null;

    const openModal = () => {
        modal.classList.add('visible');
        if (!ai) {
             ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        sourceText.focus();
    };

    const closeModal = () => {
        modal.classList.remove('visible');
        sourceText.value = '';
        targetText.value = '';
    };

    card.addEventListener('click', () => {
        const lockedIcon = card.querySelector('.service-locked') as HTMLElement;
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

        if (!textToTranslate || !ai) return;

        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        sourceText.disabled = true;

        try {
            const prompt = `Translate the following text from ${fromLang} to ${toLang}. Provide only the translated text, without any additional explanations or context. The text is: "${textToTranslate}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            targetText.value = response.text;

        } catch (error) {
            console.error("Error during translation:", error);
            targetText.value = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        } finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
            sourceText.disabled = false;
        }
    });
};

// Function to set up and manage the AI Audio Processing service
const setupAudioProcessing = () => {
    const modal = document.getElementById('audioProcessingModal') as HTMLElement;
    const card = document.getElementById('audio-processing-card') as HTMLElement;
    const closeButton = document.getElementById('closeAudioModal') as HTMLButtonElement;
    const form = document.getElementById('audioProcessingForm') as HTMLFormElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const audioUpload = document.getElementById('audioUpload') as HTMLInputElement;
    const transcriptionResult = document.getElementById('transcriptionResult') as HTMLTextAreaElement;
    const loadingOverlay = document.querySelector('#audioProcessingBody .loading-overlay') as HTMLElement;
    const audioFileName = document.getElementById('audioFileName') as HTMLElement;

    if (!modal || !card || !closeButton || !form || !submitButton || !audioUpload || !transcriptionResult || !loadingOverlay || !audioFileName) return;

    let ai: GoogleGenAI | null = null;
    let uploadedAudioData: { mimeType: string; data: string } | null = null;

    const openModal = () => {
        modal.classList.add('visible');
        if (!ai) {
             ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
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
        const lockedIcon = card.querySelector('.service-locked') as HTMLElement;
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
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const [header, base64] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];

            if (mimeType && base64) {
                 uploadedAudioData = { mimeType, data: base64 };
                 submitButton.disabled = false;
                 audioFileName.textContent = file.name;
            } else {
                 alert("Konnte Audiodatei nicht verarbeiten. Bitte versuche ein anderes Format (MP3, WAV, etc.).");
                 closeModal();
            }
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!uploadedAudioData || !ai) return;

        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;

        try {
            const audioPart = { inlineData: uploadedAudioData };
            const textPart = { text: "Transcribe this audio file." };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [audioPart, textPart] },
            });

            transcriptionResult.value = response.text;

        } catch (error) {
            console.error("Error during transcription:", error);
            transcriptionResult.value = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        } finally {
            loadingOverlay.style.display = 'none';
            submitButton.disabled = false;
        }
    });
};

// Function to set up and manage the AI Code Assistant
const setupCodeAssistant = () => {
    const modal = document.getElementById('codeAssistantModal') as HTMLElement;
    const card = document.getElementById('code-assistant-card') as HTMLElement;
    const closeButton = document.getElementById('closeCodeAssistantModal') as HTMLButtonElement;
    const form = document.getElementById('codeAssistantForm') as HTMLFormElement;
    const input = document.getElementById('codeAssistantInput') as HTMLTextAreaElement;
    const languageSelect = document.getElementById('codeLanguage') as HTMLSelectElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const resultContainer = document.getElementById('codeResultContainer') as HTMLElement;
    const codeResult = document.getElementById('codeResult') as HTMLElement;
    const placeholder = document.getElementById('codeAssistantPlaceholder') as HTMLElement;
    const loadingOverlay = document.querySelector('#codeAssistantBody .loading-overlay') as HTMLElement;

    if (!modal || !card || !closeButton || !form || !input || !languageSelect || !submitButton || !resultContainer || !codeResult || !placeholder || !loadingOverlay) return;

    let ai: GoogleGenAI | null = null;

    const openModal = () => {
        modal.classList.add('visible');
        if (!ai) {
             ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
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
        const lockedIcon = card.querySelector('.service-locked') as HTMLElement;
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
        if (!description || !ai) return;

        loadingOverlay.style.display = 'flex';
        submitButton.disabled = true;
        input.disabled = true;
        placeholder.style.display = 'none';
        resultContainer.style.display = 'none';

        try {
            const prompt = `You are an expert programmer. Your task is to act as a code assistant. The user is working with ${language}. The user's request is: "${description}". Provide only the code block as a response, without any additional explanations, introductions, or markdown formatting like \`\`\`${language.toLowerCase()}\n. Just the raw code.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            codeResult.textContent = response.text;
            resultContainer.style.display = 'block';

        } catch (error) {
            console.error("Error during code generation:", error);
            placeholder.style.display = 'block';
            placeholder.textContent = "Es tut mir leid, es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.";
        } finally {
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
} else {
    main();
}