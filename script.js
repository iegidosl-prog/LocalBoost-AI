class MarketingContentGenerator {
    constructor() {
        this.calendarData = JSON.parse(localStorage.getItem('localBoostCalendar')) || {};
        this.currentView = 'week';
        this.currentDate = new Date();
        this.imageGallery = JSON.parse(localStorage.getItem('localBoostImageGallery')) || [];
        this.currentGeneratedImage = null;
        this.currentTheme = localStorage.getItem('localBoostTheme') || 'light';
        this.chatHistory = JSON.parse(localStorage.getItem('localBoostChatHistory')) || [];
        this.currentBusinessContext = null;
        this.initTheme();
        this.initEventListeners();
    }

    initEventListeners() {
        const form = document.getElementById('marketingForm');
        const generateNewBtn = document.getElementById('generateNewBtn');
        const generateBtn = document.getElementById('generateBtn');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateContent();
            });
        }

        // Fallback: Direct button click listener
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateContent();
            });
        }

        if (generateNewBtn) {
            generateNewBtn.addEventListener('click', () => {
                this.generateContent();
            });
        }

        // Calendar event listeners
        this.initCalendarEventListeners();

        // Image generator event listeners
        this.initImageGeneratorEventListeners();

        // Theme toggle listener
        this.initThemeToggleListener();

        // Generate new content button
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'generateNewBtn') {
                this.resetForm();
            }
            
            // Handle copy prompt buttons
            if (e.target && e.target.classList.contains('copy-prompt-btn')) {
                const prompt = e.target.getAttribute('data-prompt');
                if (prompt) {
                    navigator.clipboard.writeText(prompt).then(() => {
                        this.showCopyFeedback(e.target);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                        this.fallbackCopyText(prompt);
                    });
                }
            }
            
            // Handle copy content buttons
            if (e.target && e.target.classList.contains('copy-content-btn')) {
                const content = e.target.getAttribute('data-content');
                if (content) {
                    navigator.clipboard.writeText(content).then(() => {
                        this.showCopyContentFeedback(e.target);
                    }).catch(err => {
                        console.error('Failed to copy content: ', err);
                        this.fallbackCopyText(content);
                    });
                }
            }
        });
    }

    showCopyFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ Copied!';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }

    showCopyContentFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showAlert('Prompt copied to clipboard!');
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    initChatbotEventListeners() {
        const chatbotToggle = document.getElementById('chatbotToggle');
        const minimizeChatbot = document.getElementById('minimizeChatbot');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const chatbotInput = document.getElementById('chatbotInput');
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        
        if (chatbotToggle) {
            chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        }
        
        if (minimizeChatbot) {
            minimizeChatbot.addEventListener('click', () => this.minimizeChatbot());
        }
        
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            chatbotInput.addEventListener('input', () => {
                chatbotInput.style.height = 'auto';
                chatbotInput.style.height = Math.min(chatbotInput.scrollHeight, 80) + 'px';
            });
        }
        
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggleUI();
    }

    initThemeToggleListener() {
        const themeToggleBtn = document.getElementById('themeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('localBoostTheme', this.currentTheme);
        this.updateThemeToggleUI();
    }

    updateThemeToggleUI() {
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIcon = themeToggleBtn?.querySelector('.theme-icon');
        
        if (themeIcon) {
            if (this.currentTheme === 'dark') {
                themeIcon.textContent = '☀️';
            } else {
                themeIcon.textContent = '🌙';
            }
        }
    }

    initImageGeneratorEventListeners() {
        const generateImageBtn = document.getElementById('generateImageBtn');
        const clearImageBtn = document.getElementById('clearImageBtn');
        const downloadImageBtn = document.getElementById('downloadImageBtn');
        const addToCalendarBtn = document.getElementById('addToCalendarBtn');
        const regenerateImageBtn = document.getElementById('regenerateImageBtn');
        
        if (generateImageBtn) {
            generateImageBtn.addEventListener('click', () => this.generateImage());
        }
        
        if (clearImageBtn) {
            clearImageBtn.addEventListener('click', () => this.clearImageGenerator());
        }
        
        if (downloadImageBtn) {
            downloadImageBtn.addEventListener('click', () => this.downloadGeneratedImage());
        }
        
        if (addToCalendarBtn) {
            addToCalendarBtn.addEventListener('click', () => this.addImageToCalendar());
        }
        
        if (regenerateImageBtn) {
            regenerateImageBtn.addEventListener('click', () => this.regenerateImage());
        }
    }

    initCalendarEventListeners() {
        // View toggle buttons
        const weekViewBtn = document.getElementById('weekViewBtn');
        const monthViewBtn = document.getElementById('monthViewBtn');
        
        if (weekViewBtn) {
            weekViewBtn.addEventListener('click', () => this.switchView('week'));
        }
        
        if (monthViewBtn) {
            monthViewBtn.addEventListener('click', () => this.switchView('month'));
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateCalendar('prev'));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateCalendar('next'));
        }

        // Action buttons
        const exportBtn = document.getElementById('exportCalendarBtn');
        const clearBtn = document.getElementById('clearCalendarBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCalendar());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCalendar());
        }
    }

    updatePageLanguage(language) {
        // Update any page elements that need language switching
        const html = document.documentElement;
        html.setAttribute('lang', language);
        
        // Update form labels and placeholders if needed
        this.updateFormLabels(language);
    }

    updateFormLabels(language) {
        // This can be expanded to update other UI elements
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            // Add dynamic label updates if needed
        });
    }

    generateContent() {
        const language = 'ca'; // Fixed to Catalan
        const businessType = document.getElementById('businessType').value;
        const socialMedia = document.getElementById('socialMedia').value;
        const format = document.getElementById('format').value;
        const communicationStyle = document.getElementById('communicationStyle').value;
        const dailyProducts = document.getElementById('dailyProducts').value;
        const promotions = document.getElementById('promotions').value;

        if (!businessType || !socialMedia || !communicationStyle || !dailyProducts || !promotions) {
            this.showAlert('Si us plau, completa tots els camps');
            return;
        }

        this.showLoadingState();

        setTimeout(() => {
            const content = this.createMarketingContent(language, businessType, socialMedia, format, communicationStyle, dailyProducts, promotions);
            this.displayResults(content, language);
        }, 1000);
    }

    createMarketingContent(language, businessType, socialMedia, format, communicationStyle, products, promotions) {
        const businessTypeNames = {
            restaurant: language === 'es' ? 'Restaurante/Café' : language === 'ca' ? 'Restaurant/Cafè' : 'Restaurant/Café',
            retail: language === 'es' ? 'Tienda Minorista' : language === 'ca' ? 'Botiga Minorista' : 'Retail Store',
            service: language === 'es' ? 'Negocio de Servicios' : language === 'ca' ? 'Negoci de Serveis' : 'Service Business',
            beauty: language === 'es' ? 'Belleza/Salón' : language === 'ca' ? 'Bellesa/Saló' : 'Beauty/Salon',
            fitness: language === 'es' ? 'Fitness/Gimnasio' : language === 'ca' ? 'Fitness/Gimnàs' : 'Fitness/Gym',
            bakery: language === 'es' ? 'Panadería/Pastelería' : language === 'ca' ? 'Forn/Pastisseria' : 'Bakery/Pastry',
            grocery: language === 'es' ? 'Supermercado/Tienda de Alimentos' : language === 'ca' ? 'Supermercat/Botiga d\'Aliments' : 'Grocery Store/Food Shop',
            pharmacy: language === 'es' ? 'Farmacia' : language === 'ca' ? 'Farmàcia' : 'Pharmacy',
            petshop: language === 'es' ? 'Tienda de Mascotas/Veterinaria' : language === 'ca' ? 'Botiga de Mascotes/Veterinari' : 'Pet Shop/Veterinary',
            hardware: language === 'es' ? 'Ferretería' : language === 'ca' ? 'Ferreteria' : 'Hardware Store',
            flowers: language === 'es' ? 'Florería' : language === 'ca' ? 'Floristeria' : 'Flower Shop',
            butcher: language === 'es' ? 'Carnicería' : language === 'ca' ? 'Carnisseria' : 'Butcher Shop',
            fishmonger: language === 'es' ? 'Pescadería' : language === 'ca' ? 'Peixateria' : 'Fishmonger',
            fruitstore: language === 'es' ? 'Frutería' : language === 'ca' ? 'Fruiteria' : 'Fruit Store',
            stationery: language === 'es' ? 'Papelería' : language === 'ca' ? 'Papeteria' : 'Stationery Store',
            laundry: language === 'es' ? 'Lavandería' : language === 'ca' ? 'Bugaderia' : 'Laundry',
            shoes: language === 'es' ? 'Zapatería' : language === 'ca' ? 'Sabateria' : 'Shoe Store',
            books: language === 'es' ? 'Librería' : language === 'ca' ? 'Llibreria' : 'Bookstore',
            toys: language === 'es' ? 'Juguetería' : language === 'ca' ? 'Joguina' : 'Toy Store',
            jewelry: language === 'es' ? 'Joyería' : language === 'ca' ? 'Joieria' : 'Jewelry Store',
            optics: language === 'es' ? 'Óptica' : language === 'ca' ? 'Òptica' : 'Optics',
            other: language === 'es' ? 'Otro' : language === 'ca' ? 'Altres' : 'Other'
        };

        const businessName = businessTypeNames[businessType] || (language === 'es' ? 'Negocio' : 'Business');
        const productsList = products.split(',').map(p => p.trim()).filter(p => p);
        const promotionsList = promotions.split(',').map(p => p.trim()).filter(p => p);
        
        // Auto-recommend format if not selected
        const selectedFormat = format || this.recommendFormat(socialMedia);
        
        // Generate Gemini prompts for image creation
        const geminiPrompts = this.generateGeminiPrompts(language, businessName, socialMedia, this.getStyleTemplates(communicationStyle, language), productsList, promotionsList, selectedFormat);

        return {
            geminiPrompts,
            socialMedia: this.generateSocialMediaContent(language, businessName, socialMedia, selectedFormat, communicationStyle, productsList, promotionsList),
            imageSuggestions: this.generateImageSuggestions(language, businessName, socialMedia, selectedFormat, communicationStyle, productsList),
            productPromotion: this.generateProductPromotion(language, businessName, communicationStyle, productsList, promotionsList),
            newsletter: this.generateNewsletterMessage(language, businessName, communicationStyle, productsList, promotionsList),
            campaigns: this.generateCampaignIdeas(language, businessName, socialMedia, communicationStyle, productsList, promotionsList),
            businessName,
            socialMedia,
            style: this.getStyleTemplates(communicationStyle, language),
            productsList,
            promotionsList
        };
    }

    recommendFormat(socialMedia) {
        const formatRecommendations = {
            instagram: 'carousel',
            tiktok: 'reel',
            facebook: 'post',
            linkedin: 'post',
            twitter: 'post',
            blog: 'post'
        };
        return formatRecommendations[socialMedia] || 'post';
    }

    getStyleTemplates(style, language) {
        const templates = {
            elegant: language === 'es' ? {
                greeting: 'Estimado',
                closing: 'Con mayor consideración',
                tone: 'sofisticado',
                adjectives: ['exquisito', 'premium', 'refinado', 'lujoso', 'excepcional'],
                callsToAction: ['Le invitamos a experimentar', 'Permítanos presentarle', 'Descubra la elegancia de'],
                hashtags: ['#Lujo', '#Elegancia', '#Sofisticado', '#CalidadPremium']
            } : language === 'ca' ? {
                greeting: 'Estimat',
                closing: 'Amb la màxima consideració',
                tone: 'sofisticat',
                adjectives: ['exquisit', 'premium', 'refinat', 'de luxe', 'excepcional'],
                callsToAction: ['Us convidem a experimentar', 'Permeteu-nos presentar-vos', 'Descobriu l\'elegància de'],
                hashtags: ['#Lux', '#Elegància', '#Sofisticat', '#QualitatPremium']
            } : {
                greeting: 'Esteemed',
                closing: 'With utmost regards',
                tone: 'sophisticated',
                adjectives: ['exquisite', 'premium', 'refined', 'luxurious', 'exceptional'],
                callsToAction: ['We invite you to experience', 'Allow us to present', 'Discover the elegance of'],
                hashtags: ['#Luxury', '#Elegance', '#Sophisticated', '#PremiumQuality']
            },
            friendly: language === 'es' ? {
                greeting: 'Hola',
                closing: 'Calurosamente',
                tone: 'acogedor',
                adjectives: ['increíble', 'maravilloso', 'fantástico', 'genial', 'increíble'],
                callsToAction: ['Ven a pasar el rato', 'Únete a nosotros para', 'Disfrutemos juntos'],
                hashtags: ['#Familia', '#Comunidad', '#Amigable', '#Juntos']
            } : language === 'ca' ? {
                greeting: 'Hola',
                closing: 'Cordialment',
                tone: 'acollidor',
                adjectives: ['increïble', 'meravellós', 'fantàstic', 'genial', 'increïble'],
                callsToAction: ['Vine a passar l\'estona', 'Uneix-te a nosaltres per', 'Gaudim junts'],
                hashtags: ['#Familia', '#Comunitat', '#Amigable', '#Junts']
            } : {
                greeting: 'Hey there',
                closing: 'Warmly',
                tone: 'welcoming',
                adjectives: ['amazing', 'wonderful', 'fantastic', 'great', 'awesome'],
                callsToAction: ['Come hang out', 'Join us for', 'Let\'s enjoy'],
                hashtags: ['#Family', '#Community', '#Friendly', '#Together']
            },
            simple: language === 'es' ? {
                greeting: 'Hola',
                closing: 'Gracias',
                tone: 'directo',
                adjectives: ['bueno', 'agradable', 'calidad', 'fresco', 'local'],
                callsToAction: ['Visítanos', 'Prueba nuestro', 'Consigue tu'],
                hashtags: ['#Simple', '#Directo', '#SinComplicaciones', '#Calidad']
            } : language === 'ca' ? {
                greeting: 'Hola',
                closing: 'Gràcies',
                tone: 'directe',
                adjectives: ['bo', 'agradable', 'qualitat', 'fresc', 'local'],
                callsToAction: ['Visita\'ns', 'Prova el nostre', 'Aconsegueix el teu'],
                hashtags: ['#Simple', '#Directe', '#SenseComplicacions', '#Qualitat']
            } : {
                greeting: 'Hello',
                closing: 'Thanks',
                tone: 'direct',
                adjectives: ['good', 'nice', 'quality', 'fresh', 'local'],
                callsToAction: ['Visit us', 'Try our', 'Get your'],
                hashtags: ['#Simple', '#Direct', '#NoFrills', '#Quality']
            },
            modern: language === 'es' ? {
                greeting: 'Qué tal',
                closing: 'Saludos',
                tone: 'trendy',
                adjectives: ['tendencia', 'viral', 'épico', 'genial', 'increíble'],
                callsToAction: ['Sube de nivel con', 'Experimenta el vibe', 'Entérate de'],
                hashtags: ['#Tendencia', '#Moderno', '#Viral', '#SiguienteNivel']
            } : language === 'ca' ? {
                greeting: 'Com va',
                closing: 'Salutacions',
                tone: 'trendy',
                adjectives: ['tendència', 'viral', 'èpic', 'genial', 'increïble'],
                callsToAction: ['Puja de nivell amb', 'Experimenta el vibe', 'Assabenta\'t de'],
                hashtags: ['#Tendència', '#Modern', '#Viral', '#SegüentNivell']
            } : {
                greeting: 'Hi',
                closing: 'Cheers',
                tone: 'trendy',
                adjectives: ['trending', 'viral', 'epic', 'lit', 'fire'],
                callsToAction: ['Level up with', 'Experience the vibe', 'Get in on'],
                hashtags: ['#Trending', '#Modern', '#Viral', '#NextLevel']
            }
        };
        
        return templates[style] || templates.friendly;
    }

    generateSocialMediaContent(language, businessName, socialMedia, format, communicationStyle, products, promotions) {
        const style = this.getStyleTemplates(communicationStyle, language);
        
        const platformTemplates = {
            instagram: {
                story: language === 'es' ? {
                    title: 'Story de Instagram',
                    content: `📸 **Story de Instagram**\n\n🎯 **Formato:** Story vertical (9:16)\n⏱️ **Duración:** 15 segundos por slide\n\n**Contenido sugerido:**\n• Slide 1: ${style.greeting}! ✨ ${style.adjectives[0]} ${products[0] || 'productos'} disponibles hoy\n• Slide 2: ¡${promotions[0] || 'ofertas especiales'} por tiempo limitado! ⏰\n• Slide 3: Swipe up para más info 👆\n\n**Elementos interactivos:**\n• Encuesta: "¿Te gusta nuestro ${products[0] || 'producto'}?"\n• Sticker de cuenta regresiva\n• "Desliza para ver más"\n\n${style.hashtags[0]} #StoryDelDía`,
                    hashtags: style.hashtags.slice(0, 3)
                } : {
                    title: 'Instagram Story',
                    content: `📸 **Instagram Story**\n\n🎯 **Format:** Vertical Story (9:16)\n⏱️ **Duration:** 15 seconds per slide\n\n**Suggested Content:**\n• Slide 1: ${style.greeting}! ✨ ${style.adjectives[0]} ${products[0] || 'products'} available today\n• Slide 2: ${promotions[0] || 'special offers'} for limited time! ⏰\n• Slide 3: Swipe up for more info 👆\n\n**Interactive Elements:**\n• Poll: "Do you love our ${products[0] || 'product'}?"\n• Countdown sticker\n• "Swipe up" CTA\n\n${style.hashtags[0]} #StoryOfTheDay`,
                    hashtags: style.hashtags.slice(0, 3)
                },
                post: language === 'es' ? {
                    title: 'Publicación de Instagram',
                    content: `📷 **Publicación de Instagram**\n\n**Caption sugerido:**\n\n${style.greeting}! 🌟 Hoy presentamos nuestro ${style.adjectives[1]} ${products[0] || 'producto'} con ${promotions[0] || 'ofertas especiales'}! \n\n✨ Características principales:\n• ${style.adjectives[2]} calidad garantizada\n• ${promotions[1] || 'descuento especial'} por tiempo limitado\n• Perfecto para compartir 🤝\n\n${style.callsToAction[0]} esta experiencia ${style.tone}!\n\n**Llamada a la acción:**\n👉 Comenta "ME INTERESA" para más información\n📍 Visítanos en [tu dirección]\n📞 Contáctanos: [tu teléfono]\n\n${style.hashtags.join(' ')}`,
                    hashtags: style.hashtags
                } : {
                    title: 'Instagram Post',
                    content: `📷 **Instagram Post**\n\n**Suggested Caption:**\n\n${style.greeting}! 🌟 Today we're featuring our ${style.adjectives[1]} ${products[0] || 'product'} with ${promotions[0] || 'special offers'}! \n\n✨ Key Features:\n• ${style.adjectives[2]} quality guaranteed\n• ${promotions[1] || 'special discount'} for limited time\n• Perfect for sharing 🤝\n\n${style.callsToAction[0]} this ${style.tone} experience!\n\n**Call to Action:**\n👉 Comment "INTERESTED" for more info\n📍 Visit us at [your address]\n📞 Contact: [your phone]\n\n${style.hashtags.join(' ')}`,
                    hashtags: style.hashtags
                },
                reel: language === 'es' ? {
                    title: 'Instagram Reel',
                    content: `🎥 **Instagram Reel**\n\n**Concepto de video (30 segundos):**\n\n🎵 **Audio sugerido:** Trending audio relevante\n\n**Estructura:**\n• 0-3s: Hook visual del ${products[0] || 'producto'}\n• 4-15s: Preparación/presentación ${style.adjectives[0]}\n• 16-25s: Resultado final ${style.adjectives[1]}\n• 26-30s: CTA con ${promotions[0] || 'oferta'}\n\n**Texto en pantalla:**\n• "${style.adjectives[2]} ${products[0] || 'producto'}"\n• "${promotions[0] || 'Oferta especial'} hoy"\n• "¡Swipe para comprar!"\n\n**Caption:**\n${style.greeting}! ✨ ${style.adjectives[3]} ${products[0] || 'producto'} con ${promotions[0] || 'descuento'}! ${style.callsToAction[1]} esta tendencia! ${style.hashtags[0]} #ReelsDelDía`,
                    hashtags: style.hashtags.concat(['#Reels', '#Trending'])
                } : {
                    title: 'Instagram Reel',
                    content: `🎥 **Instagram Reel**\n\n**Video Concept (30 seconds):**\n\n🎵 **Suggested Audio:** Trending relevant audio\n\n**Structure:**\n• 0-3s: Visual hook of ${products[0] || 'product'}\n• 4-15s: ${style.adjectives[0]} preparation/presentation\n• 16-25s: ${style.adjectives[1]} final result\n• 26-30s: CTA with ${promotions[0] || 'offer'}\n\n**On-screen Text:**\n• "${style.adjectives[2]} ${products[0] || 'product'}"\n• "${promotions[0] || 'Special offer'} today"\n• "Swipe to buy!"\n\n**Caption:**\n${style.greeting}! ✨ ${style.adjectives[3]} ${products[0] || 'product'} with ${promotions[0] || 'discount'}! ${style.callsToAction[1]} this trend! ${style.hashtags[0]} #ReelsOfTheDay`,
                    hashtags: style.hashtags.concat(['#Reels', '#Trending'])
                },
                carousel: language === 'es' ? {
                    title: 'Carrusel de Instagram',
                    content: `🎠 **Carrusel de Instagram**\n\n**Slide 1 (Portada):**\n📸 Foto ${style.adjectives[0]} del ${products[0] || 'producto'}\nTexto: "${style.adjectives[1]} ${products[0] || 'producto'} - ${promotions[0] || 'oferta especial'}"\n\n**Slide 2:**\n📋 Detalles y características\n• ${style.adjectives[2]} ingredientes/componentes\n• Beneficios principales\n• Por qué es ${style.adjectives[3]}\n\n**Slide 3:**\n💰 Oferta especial\n• ${promotions[0] || 'Descuento destacado'}\n• Condiciones\n• Tiempo limitado ⏰\n\n**Slide 4:**\n👥 Testimonios de clientes\n• "${style.adjectives[4]} experiencia" - Cliente feliz\n• Calidad 5⭐\n\n**Slide 5:**\n📍 Cómo conseguirlo\n• Visítanos en tienda\n• Pedidos online\n• Contacto\n\n**Caption:**\n${style.greeting}! 🌟 Descubre por qué nuestro ${products[0] || 'producto'} es ${style.adjectives[0]}. Swipe para ver todos los detalles 👉 ${style.callsToAction[0]} la ${style.tone} calidad! ${style.hashtags.join(' ')} #CarruselDelDía`,
                    hashtags: style.hashtags.concat(['#Carousel', '#ProductDetails'])
                } : {
                    title: 'Instagram Carousel',
                    content: `🎠 **Instagram Carousel**\n\n**Slide 1 (Cover):**\n📸 ${style.adjectives[0]} photo of ${products[0] || 'product'}\nText: "${style.adjectives[1]} ${products[0] || 'product'} - ${promotions[0] || 'special offer'}"\n\n**Slide 2:**\n📋 Details & features\n• ${style.adjectives[2]} ingredients/components\n• Key benefits\n• Why it's ${style.adjectives[3]}\n\n**Slide 3:**\n💰 Special offer\n• ${promotions[0] || 'Featured discount'}\n• Conditions\n• Limited time ⏰\n\n**Slide 4:**\n👥 Customer testimonials\n• "${style.adjectives[4]} experience" - Happy customer\n• 5⭐ quality\n\n**Slide 5:**\n📍 How to get it\n• Visit us in store\n• Online orders\n• Contact\n\n**Caption:**\n${style.greeting}! 🌟 Discover why our ${products[0] || 'product'} is ${style.adjectives[0]}. Swipe to see all details 👉 ${style.callsToAction[0]} the ${style.tone} quality! ${style.hashtags.join(' ')} #CarouselOfTheDay`,
                    hashtags: style.hashtags.concat(['#Carousel', '#ProductDetails'])
                }
            },
            tiktok: {
                story: language === 'es' ? {
                    title: 'Story de TikTok',
                    content: `📱 **Story de TikTok**\n\n**Contenido rápido (15 segundos):**\n\n🎵 **Audio:** Trending viral\n\n**Estructura:**\n• 0-5s: Hook visual ${style.adjectives[0]}\n• 6-12s: Presentación del ${products[0] || 'producto'}\n• 13-15s: CTA con ${promotions[0] || 'oferta'}\n\n**Texto en pantalla:**\n• "${style.adjectives[1]} ${products[0] || 'producto'}"\n• "${promotions[0] || 'Oferta flash'}"\n• "¡Link en bio!"\n\n**Hashtags:** ${style.hashtags.slice(0, 3).join(' ')} #TikTokMadeMeBuyIt #Viral`,
                    hashtags: style.hashtags.slice(0, 3).concat(['#TikTokMadeMeBuyIt', '#Viral'])
                } : {
                    title: 'TikTok Story',
                    content: `📱 **TikTok Story**\n\n**Quick Content (15 seconds):**\n\n🎵 **Audio:** Trending viral\n\n**Structure:**\n• 0-5s: ${style.adjectives[0]} visual hook\n• 6-12s: ${products[0] || 'product'} presentation\n• 13-15s: CTA with ${promotions[0] || 'offer'}\n\n**On-screen Text:**\n• "${style.adjectives[1]} ${products[0] || 'product'}"\n• "${promotions[0] || 'Flash offer'}"\n• "Link in bio!"\n\n**Hashtags:** ${style.hashtags.slice(0, 3).join(' ')} #TikTokMadeMeBuyIt #Viral`,
                    hashtags: style.hashtags.slice(0, 3).concat(['#TikTokMadeMeBuyIt', '#Viral'])
                },
                post: language === 'es' ? {
                    title: 'Video de TikTok',
                    content: `🎵 **Video de TikTok (60 segundos)**\n\n**Concepto viral:**\n\n🎬 **Estructura completa:**\n• 0-3s: Hook fuerte con ${products[0] || 'producto'}\n• 4-20s: "Antes vs Después" con ${style.adjectives[0]} resultado\n• 21-35s: Tutorial rápido o demostración\n• 36-45s: Reacción ${style.adjectives[1]}\n• 46-55s: Oferta especial con ${promotions[0] || 'descuento'}\n• 56-60s: CTA final\n\n**Audio sugerido:** Trending sound relevante\n\n**Texto en pantalla:**\n• "Este ${style.adjectives[2]} ${products[0] || 'producto'} cambió todo"\n• "${promotions[0] || '50% OFF'} solo hoy"\n• "Link en bio para comprar"\n\n**Caption:**\n${style.greeting}! ✨ ${style.adjectives[3]} ${products[0] || 'producto'} que está ${style.adjectives[4]}! ${style.callsToAction[1]} esta tendencia! ${style.hashtags[0]} #TikTokShop #ParaTi`,
                    hashtags: style.hashtags.concat(['#TikTokShop', '#ForYouPage', '#ViralProduct'])
                } : {
                    title: 'TikTok Video',
                    content: `🎵 **TikTok Video (60 seconds)**\n\n**Viral Concept:**\n\n🎬 **Full Structure:**\n• 0-3s: Strong hook with ${products[0] || 'product'}\n• 4-20s: "Before vs After" with ${style.adjectives[0]} result\n• 21-35s: Quick tutorial or demo\n• 36-45s: ${style.adjectives[1]} reaction\n• 46-55s: Special offer with ${promotions[0] || 'discount'}\n• 56-60s: Final CTA\n\n**Suggested Audio:** Relevant trending sound\n\n**On-screen Text:**\n• "This ${style.adjectives[2]} ${products[0] || 'product'} changed everything"\n• "${promotions[0] || '50% OFF'} today only"\n• "Link in bio to buy"\n\n**Caption:**\n${style.greeting}! ✨ ${style.adjectives[3]} ${products[0] || 'product'} that's ${style.adjectives[4]}! ${style.callsToAction[1]} this trend! ${style.hashtags[0]} #TikTokShop #ForYouPage`,
                    hashtags: style.hashtags.concat(['#TikTokShop', '#ForYouPage', '#ViralProduct'])
                },
                reel: language === 'es' ? {
                    title: 'TikTok Reel',
                    content: `🎥 **TikTok Reel (30 segundos)**\n\n**Formato rápido y viral:**\n\n🎵 **Audio:** Trending viral del momento\n\n**Estructura:**\n• 0-5s: Hook visual impactante\n• 6-15s: Transformación ${style.adjectives[0]}\n• 16-25s: Resultado ${style.adjectives[1]}\n• 26-30s: CTA con ${promotions[0] || 'oferta'}\n\n**Efectos:**\n• Transiciones rápidas\n• Zoom dinámico\n• Texto animado\n\n**Caption:**\n${style.greeting}! 🔥 ${style.adjectives[2]} ${products[0] || 'producto'} con ${promotions[0] || 'super oferta'}! ${style.callsToAction[2]} esta oportunidad! ${style.hashtags[0]} #TikTokViral #Reels`,
                    hashtags: style.hashtags.concat(['#TikTokViral', '#Reels', '#Trending'])
                } : {
                    title: 'TikTok Reel',
                    content: `🎥 **TikTok Reel (30 seconds)**\n\n**Quick viral format:**\n\n🎵 **Audio:** Current trending viral\n\n**Structure:**\n• 0-5s: Impactful visual hook\n• 6-15s: ${style.adjectives[0]} transformation\n• 16-25s: ${style.adjectives[1]} result\n• 26-30s: CTA with ${promotions[0] || 'offer'}\n\n**Effects:**\n• Quick transitions\n• Dynamic zoom\n• Animated text\n\n**Caption:**\n${style.greeting}! 🔥 ${style.adjectives[2]} ${products[0] || 'product'} with ${promotions[0] || 'super offer'}! ${style.callsToAction[2]} this opportunity! ${style.hashtags[0]} #TikTokViral #Reels`,
                    hashtags: style.hashtags.concat(['#TikTokViral', '#Reels', '#Trending'])
                },
                carousel: language === 'es' ? {
                    title: 'Carrusel de TikTok',
                    content: `🎠 **Carrusel de TikTok (Fotos)**\n\n**Secuencia de imágenes:**\n\n**Foto 1:**\n📸 ${style.adjectives[0]} foto principal del ${products[0] || 'producto'}\nTexto: "${style.adjectives[1]} calidad"\n\n**Foto 2:**\n🔥 Detalles y características\nTexto: "Por qué es ${style.adjectives[2]}"\n\n**Foto 3:**\n💰 Oferta especial\nTexto: "${promotions[0] || '50% OFF'} hoy"\n\n**Foto 4:**\n⭐ Testimonio\nTexto: "Clientes felices"\n\n**Foto 5:**\n📍 Cómo comprar\nTexto: "Link en bio"\n\n**Caption:**\n${style.greeting}! 🌟 Swipe para ver por qué nuestro ${products[0] || 'producto'} es ${style.adjectives[3]}. ${style.callsToAction[0]} la experiencia! ${style.hashtags.join(' ')} #TikTokPhotos`,
                    hashtags: style.hashtags.concat(['#TikTokPhotos', '#PhotoCarousel'])
                } : {
                    title: 'TikTok Carousel',
                    content: `🎠 **TikTok Photo Carousel**\n\n**Image sequence:**\n\n**Photo 1:**\n📸 ${style.adjectives[0]} main photo of ${products[0] || 'product'}\nText: "${style.adjectives[1]} quality"\n\n**Photo 2:**\n🔥 Details & features\nText: "Why it's ${style.adjectives[2]}"\n\n**Photo 3:**\n💰 Special offer\nText: "${promotions[0] || '50% OFF'} today"\n\n**Photo 4:**\n⭐ Testimonial\nText: "Happy customers"\n\n**Photo 5:**\n📍 How to buy\nText: "Link in bio"\n\n**Caption:**\n${style.greeting}! 🌟 Swipe to see why our ${products[0] || 'product'} is ${style.adjectives[3]}. ${style.callsToAction[0]} the experience! ${style.hashtags.join(' ')} #TikTokPhotos`,
                    hashtags: style.hashtags.concat(['#TikTokPhotos', '#PhotoCarousel'])
                }
            },
            facebook: {
                post: language === 'es' ? {
                    title: 'Publicación de Facebook',
                    content: `📘 **Publicación de Facebook**\n\n**Texto principal:**\n\n${style.greeting} comunidad! 🌟\n\nHoy queremos compartir con ustedes nuestros ${style.adjectives[0]} ${products[0] || 'productos'} con ${promotions[0] || 'ofertas especiales'}! 🎉\n\n✨ **Características destacadas:**\n• ${style.adjectives[1]} calidad garantizada\n• ${style.adjectives[2]} atención al cliente\n• ${promotions[1] || 'descuentos especiales'} por tiempo limitado\n\n📸 **Adjunta fotos de:**\n• ${products[0] || 'Producto principal'} en primer plano\n• Ambientación del ${businessName}\n• Clientes felices (si tienes permiso)\n\n**Llamada a la acción:**\n👉 Comenta "ME INTERESA" y te enviaremos información\n📍 Visítanos: [tu dirección]\n📞 Llámanos: [tu teléfono]\n⏰ Horario: [tu horario]\n\n${style.hashtags.join(' ')}\n\n**Recordatorio:** ¡Las ${promotions[0] || 'ofertas'} son por tiempo limitado! No te quedes sin la tuya. 💫`,
                    hashtags: style.hashtags.concat(['#Facebook', '#Comunidad', '#Ofertas'])
                } : {
                    title: 'Facebook Post',
                    content: `📘 **Facebook Post**\n\n**Main Text:**\n\n${style.greeting} community! 🌟\n\nToday we want to share our ${style.adjectives[0]} ${products[0] || 'products'} with ${promotions[0] || 'special offers'}! 🎉\n\n✨ **Highlighted Features:**\n• ${style.adjectives[1]} quality guaranteed\n• ${style.adjectives[2]} customer service\n• ${promotions[1] || 'special discounts'} for limited time\n\n📸 **Attach photos of:**\n• ${products[0] || 'Main product'} close-up\n• ${businessName} ambiance\n• Happy customers (if you have permission)\n\n**Call to Action:**\n👉 Comment "INTERESTED" and we'll send you info\n📍 Visit us: [your address]\n📞 Call us: [your phone]\n⏰ Hours: [your hours]\n\n${style.hashtags.join(' ')}\n\n**Reminder:** ${promotions[0] || 'Offers'} are for limited time! Don't miss out. 💫`,
                    hashtags: style.hashtags.concat(['#Facebook', '#Community', '#Offers'])
                }
            },
            linkedin: {
                post: language === 'es' ? {
                    title: 'Publicación de LinkedIn',
                    content: `💼 **Publicación de LinkedIn**\n\n**Título:** ${style.adjectives[0]} Oportunidad de Negocio: ${products[0] || 'Productos'} de Calidad\n\n**Contenido profesional:**\n\n${style.greeting} profesionales de la industria,\n\nEn ${businessName}, estamos comprometidos con la ${style.adjectives[1]} excelencia en el sector. Hoy queremos presentar nuestra ${style.adjectives[2]} línea de ${products.join(', ')}.\n\n🎯 **Puntos clave:**\n• ${style.adjectives[3]} calidad y consistencia\n• ${promotions[0] || 'Ofertas comerciales'} competitivas\n• Servicio al cliente ${style.tone}\n• Entrega confiable y puntual\n\n📈 **Propuesta de valor:**\nNuestros ${products[0] || 'productos'} están diseñados para superar expectativas y generar resultados ${style.adjectives[4]}.\n\n🤝 **Invitación a colaborar:**\nEstamos buscando partnerships estratégicos con empresas que valoran la calidad.\n\n📞 **Contacto profesional:**\n• Email: [email profesional]\n• Teléfono: [teléfono business]\n• LinkedIn: [perfil de empresa]\n\n${style.hashtags[0]} #Business #Profesional #Calidad`,
                    hashtags: ['#LinkedIn', '#Business', '#Professional', '#Quality']
                } : {
                    title: 'LinkedIn Post',
                    content: `💼 **LinkedIn Post**\n\n**Title:** ${style.adjectives[0]} Business Opportunity: Quality ${products[0] || 'Products'}\n\n**Professional Content:**\n\n${style.greeting} industry professionals,\n\nAt ${businessName}, we are committed to ${style.adjectives[1]} excellence in our sector. Today we want to present our ${style.adjectives[2]} line of ${products.join(', ')}.\n\n🎯 **Key Points:**\n• ${style.adjectives[3]} quality and consistency\n• ${promotions[0] || 'Commercial offers'} competitive\n• ${style.tone} customer service\n• Reliable and timely delivery\n\n📈 **Value Proposition:**\nOur ${products[0] || 'products'} are designed to exceed expectations and deliver ${style.adjectives[4]} results.\n\n🤝 **Collaboration Invitation:**\nWe are seeking strategic partnerships with businesses that value quality.\n\n📞 **Professional Contact:**\n• Email: [professional email]\n• Phone: [business phone]\n• LinkedIn: [company profile]\n\n${style.hashtags[0]} #Business #Professional #Quality`,
                    hashtags: ['#LinkedIn', '#Business', '#Professional', '#Quality']
                }
            },
            twitter: {
                post: language === 'es' ? {
                    title: 'Post de X / Twitter',
                    content: `🐦 **Post de X / Twitter (280 caracteres)**\n\n**Opción 1:**\n${style.greeting}! 🔥 ${style.adjectives[0]} ${products[0] || 'producto'} con ${promotions[0] || '50% OFF'} hoy! 🎉\n\n✨ Calidad ${style.tone}\n⏰ Oferta limitada\n📍 [tu dirección]\n\n${style.hashtags[0]} #OfertaDelDía\n\n**Opción 2:**\n🌟 ${style.adjectives[1]} ${products[0] || 'productos'} disponibles! 🚀\n\n${promotions[1] || 'Descuento especial'} esta semana\nCalidad ${style.adjectives[2]} garantizada\n¡Visítanos! 👇\n\n[tu enlace]\n\n${style.hashtags[1]} #Calidad`,
                    hashtags: style.hashtags.slice(0, 2)
                } : {
                    title: 'X / Twitter Post',
                    content: `🐦 **X / Twitter Post (280 characters)**\n\n**Option 1:**\n${style.greeting}! 🔥 ${style.adjectives[0]} ${products[0] || 'product'} with ${promotions[0] || '50% OFF'} today! 🎉\n\n✨ ${style.tone} Quality\n⏰ Limited offer\n📍 [your address]\n\n${style.hashtags[0]} #DealOfTheDay\n\n**Option 2:**\n🌟 ${style.adjectives[1]} ${products[0] || 'products'} available! 🚀\n\n${promotions[1] || 'Special discount'} this week\n${style.adjectives[2]} quality guaranteed\nVisit us! 👇\n\n[your link]\n\n${style.hashtags[1]} #Quality`,
                    hashtags: style.hashtags.slice(0, 2)
                }
            },
            blog: {
                post: language === 'es' ? {
                    title: 'Artículo de Blog / Web',
                    content: `🌐 **Artículo de Blog / Web**\n\n**Título SEO:** "${style.adjectives[0]} ${products[0] || 'Producto'}: Guía Completa y Ofertas Exclusivas"\n\n**Estructura del artículo:**\n\n**1. Introducción (150 palabras)**\n${style.greeting} lector/a,\n\nBienvenido a nuestra guía completa sobre los ${style.adjectives[1]} ${products[0] || 'productos'} que ofrecemos en ${businessName}. En este artículo, descubrirá por qué nuestros productos son la elección ${style.adjectives[2]} para quienes buscan calidad y ${style.tone} atención.\n\n**2. Características Principales (300 palabras)**\n\n🌟 **Calidad Superior:**\nNuestros ${products.join(' y ')} son seleccionados con los más altos estándares de calidad. Cada ${products[0] || 'producto'} pasa por rigurosos controles para garantizar su ${style.adjectives[3]} excelencia.\n\n💎 **Beneficios Únicos:**\n• ${style.adjectives[4]} sabor/textura/calidad\n• Ingredientes/componentes premium\n• Proceso de elaboración artesanal\n• Presentación impecable\n\n**3. Ofertas Especiales (200 palabras)**\n\n🎉 **Promociones Actuales:**\n${promotions.map((promo, index) => `• ${promo}: ${style.adjectives[index % style.adjectives.length]} valor`).join('\\n')}\n\n⏰ **Tiempo Limitado:**\nEstas ofertas están disponibles por tiempo limitado. Aproveche ahora para garantizar los mejores precios.\n\n**4. Testimonios de Clientes (150 palabras)**\n\n"${style.adjectives[0]} experiencia, sin duda volveré" - Cliente Satisfecho\n\n"La ${style.tone} atención y calidad de ${businessName} es incomparable" - Cliente Regular\n\n**5. Cómo Comprar (100 palabras)**\n\n📍 **Visítanos:** [dirección completa]\n📞 **Llámanos:** [teléfono]\n🌐 **Online:** [sitio web]\n⏰ **Horario:** [horario completo]\n\n**6. Conclusión (100 palabras)**\n\nEn ${businessName}, estamos comprometidos con ofrecerle ${style.adjectives[1]} productos y ${style.tone} servicio. ${style.callsToAction[0]} la diferencia que la calidad hace.\n\n**Meta descripción SEO:** "Descubre nuestros ${style.adjectives[0]} ${products[0] || 'productos'} con ${promotions[0] || 'ofertas especiales'}. Calidad ${style.tone} y atención excepcional en ${businessName}."\n\n**Keywords:** ${products.join(', ')}, ${businessName}, ${style.adjectives.join(', ')}\n\n${style.hashtags.join(' ')}`,
                    hashtags: style.hashtags.concat(['#Blog', '#SEO', '#Contenido'])
                } : {
                    title: 'Blog / Web Article',
                    content: `🌐 **Blog / Web Article**\n\n**SEO Title:** "${style.adjectives[0]} ${products[0] || 'Product'}: Complete Guide and Exclusive Offers"\n\n**Article Structure:**\n\n**1. Introduction (150 words)**\n${style.greeting} reader,\n\nWelcome to our complete guide about the ${style.adjectives[1]} ${products[0] || 'products'} we offer at ${businessName}. In this article, you'll discover why our products are the ${style.adjectives[2]} choice for those seeking quality and ${style.tone} service.\n\n**2. Key Features (300 words)**\n\n🌟 **Superior Quality:**\nOur ${products.join(' and ')} are selected with the highest quality standards. Each ${products[0] || 'product'} undergoes rigorous testing to ensure its ${style.adjectives[3]} excellence.\n\n💎 **Unique Benefits:**\n• ${style.adjectives[4]} taste/texture/quality\n• Premium ingredients/components\n• Artisanal production process\n• Impeccable presentation\n\n**3. Special Offers (200 words)**\n\n🎉 **Current Promotions:**\n${promotions.map((promo, index) => `• ${promo}: ${style.adjectives[index % style.adjectives.length]} value`).join('\\n')}\n\n⏰ **Limited Time:**\nThese offers are available for limited time. Take advantage now to secure the best prices.\n\n**4. Customer Testimonials (150 words)**\n\n"${style.adjectives[0]} experience, will definitely return" - Satisfied Customer\n\n"The ${style.tone} service and quality at ${businessName} is unmatched" - Regular Customer\n\n**5. How to Buy (100 words)**\n\n📍 **Visit Us:** [full address]\n📞 **Call Us:** [phone]\n🌐 **Online:** [website]\n⏰ **Hours:** [full hours]\n\n**6. Conclusion (100 words)**\n\nAt ${businessName}, we're committed to offering you ${style.adjectives[1]} products and ${style.tone} service. ${style.callsToAction[0]} the difference quality makes.\n\n**SEO Meta Description:** "Discover our ${style.adjectives[0]} ${products[0] || 'products'} with ${promotions[0] || 'special offers'}. ${style.tone} quality and exceptional service at ${businessName}."\n\n**Keywords:** ${products.join(', ')}, ${businessName}, ${style.adjectives.join(', ')}\n\n${style.hashtags.join(' ')}`,
                    hashtags: style.hashtags.concat(['#Blog', '#SEO', '#Content'])
                }
            }
        };

        const platformContent = platformTemplates[socialMedia]?.[format] || platformTemplates[socialMedia]?.post;
        
        if (!platformContent) {
            return language === 'es' ? 
                `<p>Contenido no disponible para esta plataforma y formato.</p>` : 
                `<p>Content not available for this platform and format.</p>`;
        }

        return `
            <h4>${platformContent.title}</h4>
            <div class="platform-content">${platformContent.content}</div>
            <div class="hashtags"><strong>${language === 'es' ? 'Hashtags sugeridos:' : 'Suggested hashtags:'}</strong> ${platformContent.hashtags.join(' ')}</div>
        `;
    }

    generateImageSuggestions(language, businessName, socialMedia, format, communicationStyle, products) {
        const style = this.getStyleTemplates(communicationStyle, language);
        
        const imageTemplates = {
            instagram: {
                story: language === 'es' ? {
                    title: 'Imágenes para Story de Instagram',
                    suggestions: `
📸 **Sugerencias visuales para Story (9:16):**\n\n**Imagen 1 - Producto Principal:**\n• Foto vertical del ${products[0] || 'producto'} con fondo ${style.adjectives[0]}\n• Iluminación brillante y atractiva\n• Texto superpuesto: "${style.adjectives[1]} calidad"\n• Colores vibrantes que destaquen el producto\n\n**Imagen 2 - Oferta Especial:**\n• Diseño gráfico con ${promotions[0] || '50% OFF'}\n• Fondo degradado en colores de marca\n• Elementos animados: estrellas, parpadeos\n• Temporizador visual: "24 horas"\n\n**Imagen 3 - CTA Interactivo:**\n• Foto del local con señal "Swipe Up"\n• Icono de flecha animada\n• Texto: "¡Compra ahora!"\n• Elementos de marca consistentes\n\n**Herramientas recomendadas:**\n• Canva: Plantillas de Story\n• Adobe Express: Diseños rápidos\n• Unsplash: Fotos de stock gratuitas\n• Remove.bg: Eliminar fondos\n\n**Especificaciones técnicas:**\n• Resolución: 1080x1920px\n• Formato: JPG o PNG\n• Tamaño máximo: 30MB\n• Duración: 15 segundos por slide`
                } : {
                    title: 'Instagram Story Images',
                    suggestions: `
📸 **Visual suggestions for Story (9:16):**\n\n**Image 1 - Main Product:**\n• Vertical photo of ${products[0] || 'product'} with ${style.adjectives[0]} background\n• Bright and attractive lighting\n• Overlay text: "${style.adjectives[1]} quality"\n• Vibrant colors that highlight the product\n\n**Image 2 - Special Offer:**\n• Graphic design with ${promotions[0] || '50% OFF'}\n• Gradient background in brand colors\n• Animated elements: stars, sparkles\n• Visual timer: "24 hours"\n\n**Image 3 - Interactive CTA:**\n• Store photo with "Swipe Up" sign\n• Animated arrow icon\n• Text: "Buy now!"\n• Consistent brand elements\n\n**Recommended Tools:**\n• Canva: Story templates\n• Adobe Express: Quick designs\n• Unsplash: Free stock photos\n• Remove.bg: Background removal\n\n**Technical Specs:**\n• Resolution: 1080x1920px\n• Format: JPG or PNG\n• Max size: 30MB\n• Duration: 15 seconds per slide`
                }
            },
            facebook: {
                post: language === 'es' ? {
                    title: 'Imágenes para Facebook Post',
                    suggestions: `
📘 **Imágenes optimizadas para Facebook (1:1 o 16:9):**\n\n**Imagen Principal - Producto Destacado:**\n• Foto cuadrada (1080x1080px) del ${products[0] || 'producto'}\n• Composición centrada con espacio para texto\n• Iluminación profesional y fondo limpio\n• Pequeño logo de marca en esquina\n\n**Imagen Secundaria - Ambientación:**\n• Foto horizontal (1200x630px) del local\n• Clientes disfrutando (con permiso)\n• Atmósfera ${style.tone} y acogedora\n• Elementos de branding visibles\n\n**Imagen de Oferta - Gráfico:**\n• Diseño con ${promotions[0] || 'oferta especial'} destacada\n• Colores de marca consistentes\n• Tipografía legible y atractiva\n• Elementos visuales de urgencia\n\n**Carousel - Galería de Productos:**\n• Secuencia de 5-7 fotos de diferentes ${products.join(' y ')}\n• Cada foto con texto descriptivo corto\n• Estilo visual consistente\n• Transiciones suaves entre imágenes\n\n**Herramientas recomendadas:**\n• Canva: Plantillas de Facebook\n• Adobe Creative Suite: Edición profesional\n• Pixlr: Edición online gratuita\n• VistaCreate: Diseños de redes sociales\n\n**Especificaciones técnicas:**\n• Post: 1200x630px (óptimo)\n• Carrusel: 1080x1080px por imagen\n• Formato: JPG (80% calidad)\n• Tamaño: Máximo 30MB`
                } : {
                    title: 'Facebook Post Images',
                    suggestions: `
📘 **Facebook optimized images (1:1 or 16:9):**\n\n**Main Image - Featured Product:**\n• Square photo (1080x1080px) of ${products[0] || 'product'}\n• Centered composition with text space\n• Professional lighting and clean background\n• Small brand logo in corner\n\n**Secondary Image - Ambiance:**\n• Horizontal photo (1200x630px) of store\n• Customers enjoying (with permission)\n• ${style.tone} and welcoming atmosphere\n• Visible branding elements\n\n**Offer Image - Graphic:**\n• Design with ${promotions[0] || 'special offer'} highlighted\n• Consistent brand colors\n• Legible and attractive typography\n• Visual urgency elements\n\n**Carousel - Product Gallery:**\n• Sequence of 5-7 photos of different ${products.join(' and ')}\n• Each photo with short descriptive text\n• Consistent visual style\n• Smooth transitions between images\n\n**Recommended Tools:**\n• Canva: Facebook templates\n• Adobe Creative Suite: Professional editing\n• Pixlr: Free online editing\n• VistaCreate: Social media designs\n\n**Technical Specs:**\n• Post: 1200x630px (optimal)\n• Carousel: 1080x1080px per image\n• Format: JPG (80% quality)\n• Size: Maximum 30MB`
                }
            },
            tiktok: {
                reel: language === 'es' ? {
                    title: 'Visual para TikTok Reel',
                    suggestions: `
🎵 **Contenido visual para TikTok Reel (9:16):**\n\n**Escena 1 - Hook (0-3 segundos):**\n• Primer plano extremo del ${products[0] || 'producto'}\n• Movimiento rápido y dinámico\n• Efecto de zoom dramático\n• Texto grande: "¡Mira esto!"\n\n**Escena 2 - Transformación (4-15 segundos):**\n• Video lateral del proceso de preparación\n• Movimientos fluidos y cinematográficos\n• Cambios de iluminación ${style.adjectives[0]}\n• Texto animado: "${style.adjectives[1]} proceso"\n\n**Escena 3 - Resultado (16-25 segundos):**\n• Presentación final ${style.adjectives[2]}\n• Rotación de 360° del producto\n• Efectos de partículas o brillo\n• Texto: "${style.adjectives[3]} resultado"\n\n**Escena 4 - CTA (26-30 segundos):**\n• Producto con ${promotions[0] || 'oferta'} superpuesta\n• Flecha animada hacia abajo\n• Texto: "¡Link en bio!"\n• Logo de marca final\n\n**Efectos y transiciones:**\n• Cuts rápidos entre escenas\n• Zoom in/out dinámico\n• Efectos de color y filtros\n• Texto animado con música\n\n**Herramientas de edición:**\n• CapCut: Edición móvil profesional\n• TikTok Editor: Efectos integrados\n• InShot: Transiciones y texto\n• VN Editor: Edición avanzada móvil\n\n**Especificaciones técnicas:**\n• Resolución: 1080x1920px\n• Duración: 15-60 segundos\n• Formato: MP4 o MOV\n• Frame rate: 30-60 fps\n• Audio: Música trending de TikTok`
                } : {
                    title: 'TikTok Reel Visual',
                    suggestions: `
🎵 **Visual content for TikTok Reel (9:16):**\n\n**Scene 1 - Hook (0-3 seconds):**\n• Extreme close-up of ${products[0] || 'product'}\n• Fast and dynamic movement\n• Dramatic zoom effect\n• Large text: "Look at this!"\n\n**Scene 2 - Transformation (4-15 seconds):**\n• Side view of preparation process\n• Smooth and cinematic movements\n• ${style.adjectives[0]} lighting changes\n• Animated text: "${style.adjectives[1]} process"\n\n**Scene 3 - Result (16-25 seconds):**\n• ${style.adjectives[2]} final presentation\n• 360° product rotation\n• Particle or sparkle effects\n• Text: "${style.adjectives[3]} result"\n\n**Scene 4 - CTA (26-30 seconds):**\n• Product with ${promotions[0] || 'offer'} overlay\n• Animated arrow pointing down\n• Text: "Link in bio!"\n• Final brand logo\n\n**Effects and Transitions:**\n• Quick cuts between scenes\n• Dynamic zoom in/out\n• Color effects and filters\n• Text animated with music\n\n**Editing Tools:**\n• CapCut: Professional mobile editing\n• TikTok Editor: Built-in effects\n• InShot: Transitions and text\n• VN Editor: Advanced mobile editing\n\n**Technical Specs:**\n• Resolution: 1080x1920px\n• Duration: 15-60 seconds\n• Format: MP4 or MOV\n• Frame rate: 30-60 fps\n• Audio: Trending TikTok music`
                }
            },
            linkedin: {
                post: language === 'es' ? {
                    title: 'Imágenes Profesionales para LinkedIn',
                    suggestions: `
💼 **Contenido visual profesional para LinkedIn:**\n\n**Imagen Principal - Corporativa:**\n• Foto horizontal (1200x627px) del ${products[0] || 'producto'}\n• Estilo fotográfico profesional y limpio\n• Composición equilibrada con espacio para texto\n• Colores corporativos consistentes\n\n**Infografía - Propuesta de Valor:**\n• Diseño ${style.adjectives[0]} con datos clave\n• Gráficos de beneficios y características\n• Tipografía profesional y legible\n• Esquema de colores de marca\n\n**Imagen Secundaria - Equipo/Instalaciones:**\n• Foto del equipo trabajando (si aplica)\n• Imágenes de las instalaciones ${style.adjectives[1]}\n• Ambiente profesional y moderno\n• Elementos de branding sutiles\n\n**Galería - Productos/Servicios:**\n• Secuencia de imágenes profesionales\n• Cada producto con fondo consistente\n• Iluminación de estudio\n• Texto descriptivo profesional\n\n**Herramientas recomendadas:**\n• Canva for Business: Plantillas profesionales\n• Adobe Illustrator: Diseño vectorial\n• Piktochart: Infografías\n• Visme: Presentaciones visuales\n\n**Especificaciones técnicas:**\n• Resolución: 1200x627px (óptimo)\n• Formato: PNG o JPG\n• Calidad: Alta (sin compresión excesiva)\n• Tamaño: Máximo 5MB\n\n**Estilo visual recomendado:**\n• Paleta de colores profesional\n• Tipografía sans-serif moderna\n• Composición limpia y ordenada\n• Espacio blanco adecuado\n• Elementos de marca consistentes`
                } : {
                    title: 'Professional LinkedIn Images',
                    suggestions: `
💼 **Professional visual content for LinkedIn:**\n\n**Main Image - Corporate:**\n• Horizontal photo (1200x627px) of ${products[0] || 'product'}\n• Professional and clean photo style\n• Balanced composition with text space\n• Consistent corporate colors\n\n**Infographic - Value Proposition:**\n• ${style.adjectives[0]} design with key data\n• Benefits and features graphics\n• Professional and legible typography\n• Brand color scheme\n\n**Secondary Image - Team/Facilities:**\n• Team working photo (if applicable)\n• ${style.adjectives[1]} facility images\n• Professional and modern atmosphere\n• Subtle branding elements\n\n**Gallery - Products/Services:**\n• Sequence of professional images\n• Each product with consistent background\n• Studio lighting\n• Professional descriptive text\n\n**Recommended Tools:**\n• Canva for Business: Professional templates\n• Adobe Illustrator: Vector design\n• Piktochart: Infographics\n• Visme: Visual presentations\n\n**Technical Specs:**\n• Resolution: 1200x627px (optimal)\n• Format: PNG or JPG\n• Quality: High (without excessive compression)\n• Size: Maximum 5MB\n\n**Recommended Visual Style:**\n• Professional color palette\n• Modern sans-serif typography\n• Clean and orderly composition\n• Adequate white space\n• Consistent brand elements`
                }
            },
            twitter: {
                post: language === 'es' ? {
                    title: 'Imágenes para X / Twitter',
                    suggestions: `
🐦 **Contenido visual para X / Twitter:**\n\n**Imagen Principal - Producto:**\n• Formato 16:9 (1200x675px) del ${products[0] || 'producto'}\n• Composición centrada y llamativa\n• Texto superpuesto grande y legible\n• Colores vibrantes pero profesionales\n\n**Gráfico de Oferta:**\n• Diseño con ${promotions[0] || 'oferta destacada'}\n• Fondo sólido para máxima legibilidad\n• Tipografía sans-serif bold\n• Elementos visuales de urgencia\n\n**Infografía Rápida:**\n• Datos clave sobre ${products.join(' y ')}\n• Iconos simples y reconocibles\n• Jerarquía visual clara\n• Colores de marca consistentes\n\n**Carousel - Galería:**\n• Máximo 4 imágenes\n• Cada imagen 1200x675px\n• Estilo visual consistente\n• Transición suave entre imágenes\n\n**Herramientas recomendadas:**\n• Canva: Plantillas de Twitter\n• Adobe Express: Diseños rápidos\n• Snappa: Redes sociales\n• Fotor: Edición online\n\n**Especificaciones técnicas:**\n• Resolución: 1200x675px (óptimo)\n• Formato: JPG o PNG\n• Tamaño: Máximo 5MB\n• Relación de aspecto: 16:9 o 1:1\n\n**Consideraciones especiales:**\n• Texto legible en dispositivos móviles\n• Contraste adecuado para accesibilidad\n• Elementos de marca visibles\n• Optimizado para carga rápida`
                } : {
                    title: 'X / Twitter Images',
                    suggestions: `
🐦 **Visual content for X / Twitter:**\n\n**Main Image - Product:**\n• 16:9 format (1200x675px) of ${products[0] || 'product'}\n• Centered and eye-catching composition\n• Large and legible overlay text\n• Vibrant but professional colors\n\n**Offer Graphic:**\n• Design with ${promotions[0] || 'featured offer'}\n• Solid background for maximum legibility\n• Bold sans-serif typography\n• Visual urgency elements\n\n**Quick Infographic:**\n• Key data about ${products.join(' and ')}\n• Simple and recognizable icons\n• Clear visual hierarchy\n• Consistent brand colors\n\n**Carousel - Gallery:**\n• Maximum 4 images\n• Each image 1200x675px\n• Consistent visual style\n• Smooth transition between images\n\n**Recommended Tools:**\n• Canva: Twitter templates\n• Adobe Express: Quick designs\n• Snappa: Social media\n• Fotor: Online editing\n\n**Technical Specs:**\n• Resolution: 1200x675px (optimal)\n• Format: JPG or PNG\n• Size: Maximum 5MB\n• Aspect ratio: 16:9 or 1:1\n\n**Special Considerations:**\n• Legible text on mobile devices\n• Adequate contrast for accessibility\n• Visible brand elements\n• Optimized for fast loading`
                }
            },
            blog: {
                post: language === 'es' ? {
                    title: 'Imágenes para Blog / Web',
                    suggestions: `
🌐 **Contenido visual para Blog / Web:**\n\n**Imagen Hero - Encabezado:**\n• Formato 16:9 (1920x1080px) del ${products[0] || 'producto'}\n• Alta calidad y resolución\n• Composición equilibrada con espacio para título\n• Iluminación profesional y atractiva\n\n**Imágenes de Producto - Galería:**\n• Múltiples ángulos del ${products[0] || 'producto'}\n• Fondos blancos o neutros\n• Iluminación de estudio consistente\n• Detalles y características destacadas\n\n**Infografías Informativas:**\n• Diseños ${style.adjectives[0]} con datos del producto\n• Comparativas y beneficios\n• Proceso de elaboración (si aplica)\n• Estadísticas y testimonios\n\n**Imágenes de Contexto:**\n• Fotos del local/equipo\n• Clientes disfrutando productos\n• Ambiente y experiencia ${style.tone}\n• Elementos de branding integrados\n\n**Optimización SEO:**\n• Textos ALT descriptivos\n• Nombres de archivo optimizados\n• Tamaño de archivo balanceado\n• Formatos modernos (WebP)\n\n**Herramientas recomendadas:**\n• Adobe Photoshop: Edición profesional\n• Canva: Diseño web y blog\n• Piktochart: Infografías\n• Unsplash: Fotos de stock\n• TinyPNG: Optimización de imágenes\n\n**Especificaciones técnicas:**\n• Hero: 1920x1080px (máximo 250KB)\n• Galería: 800x600px (máximo 100KB)\n• Formatos: JPG, PNG, WebP\n• Compresión: 80-90% calidad\n\n**Consideraciones UX:**\n• Tiempo de carga optimizado\n• Diseño responsive\n• Accesibilidad con textos ALT\n• Jerarquía visual clara`
                } : {
                    title: 'Blog / Web Images',
                    suggestions: `
🌐 **Visual content for Blog / Web:**\n\n**Hero Image - Header:**\n• 16:9 format (1920x1080px) of ${products[0] || 'product'}\n• High quality and resolution\n• Balanced composition with title space\n• Professional and attractive lighting\n\n**Product Images - Gallery:**\n• Multiple angles of ${products[0] || 'product'}\n• White or neutral backgrounds\n• Consistent studio lighting\n• Highlighted details and features\n\n**Informational Infographics:**\n• ${style.adjectives[0]} designs with product data\n• Comparisons and benefits\n• Production process (if applicable)\n• Statistics and testimonials\n\n**Context Images:**\n• Store/team photos\n• Customers enjoying products\n• ${style.tone} atmosphere and experience\n• Integrated branding elements\n\n**SEO Optimization:**\n• Descriptive ALT texts\n• Optimized file names\n• Balanced file size\n• Modern formats (WebP)\n\n**Recommended Tools:**\n• Adobe Photoshop: Professional editing\n• Canva: Web and blog design\n• Piktochart: Infographics\n• Unsplash: Stock photos\n• TinyPNG: Image optimization\n\n**Technical Specs:**\n• Hero: 1920x1080px (max 250KB)\n• Gallery: 800x600px (max 100KB)\n• Formats: JPG, PNG, WebP\n• Compression: 80-90% quality\n\n**UX Considerations:**\n• Optimized loading time\n• Responsive design\n• Accessibility with ALT texts\n• Clear visual hierarchy`
                }
            }
        };

        const imageContent = imageTemplates[socialMedia]?.[format] || imageTemplates[socialMedia]?.post;
        
        if (!imageContent) {
            return language === 'es' ? 
                `<p>Sugerencias de imágenes no disponibles para esta plataforma y formato.</p>` : 
                `<p>Image suggestions not available for this platform and format.</p>`;
        }

        return `
            <h4>${imageContent.title}</h4>
            <div class="image-content">${imageContent.suggestions}</div>
        `;
    }

    generateProductPromotion(language, businessName, communicationStyle, products, promotions) {
        const style = this.getStyleTemplates(communicationStyle, language);
        const promotionText = language === 'es' ? `
            <p><strong>🏆 Calidad ${style.adjectives[0]}, Valor ${style.adjectives[1]}!</strong></p>
            <p>${style.greeting}, en ${businessName}, estamos ${style.tone} sobre nuestros cuidadosamente seleccionados ${products.join(', ')}. Cada artículo es elegido pensando en nuestros clientes, asegurando la experiencia más ${style.adjectives[2]}.</p>
            <p><strong>Ofertas ${style.adjectives[3]} de Hoy:</strong></p>
            <ul>
                ${promotions.map(promo => `<li>✅ ${promo}</li>`).join('')}
            </ul>
            <p><strong>¿Por qué elegirnos?</strong></p>
            <ul>
                <li>🌟 Productos de calidad ${style.adjectives[4]}</li>
                <li>💰 Precios competitivos con promociones actuales</li>
                <li>🤝 Servicio ${style.tone} y personalizado</li>
                <li>📍 Ubicación conveniente</li>
            </ul>
            <p><em>${style.callsToAction[0]} ${businessName} y experimenta la diferencia ¡Tu satisfacción es nuestra prioridad!</em></p>
        ` : `
            <p><strong>🏆 ${style.adjectives[0].charAt(0).toUpperCase() + style.adjectives[0].slice(1)} Quality, ${style.adjectives[1]} Value!</strong></p>
            <p>${style.greeting}, at ${businessName}, we're ${style.tone} about our carefully selected ${products.join(', ')}. Each item is chosen with our customers in mind, ensuring the most ${style.adjectives[2]} experience.</p>
            <p><strong>Today's ${style.adjectives[3]} Offers:</strong></p>
            <ul>
                ${promotions.map(promo => `<li>✅ ${promo}</li>`).join('')}
            </ul>
            <p><strong>Why Choose Us?</strong></p>
            <ul>
                <li>🌟 ${style.adjectives[4]} quality products</li>
                <li>💰 Competitive pricing with current promotions</li>
                <li>🤝 ${style.tone}, personalized service</li>
                <li>📍 Convenient location</li>
            </ul>
            <p><em>${style.callsToAction[0]} ${businessName} and experience the difference! Your satisfaction is our priority.</em></p>
        `;

        return promotionText;
    }

    generateNewsletterMessage(language, businessName, communicationStyle, products, promotions) {
        const style = this.getStyleTemplates(communicationStyle, language);
        const newsletter = language === 'es' ? `
            <p><strong>📧 Boletín Semanal - ${businessName}</strong></p>
            <p>${style.greeting} Cliente Valorado,</p>
            <p>¡Esperamos que este mensaje te encuentre bien! Estamos emocionados de compartir nuestras ${style.adjectives[0]} actualizaciones y ${style.adjectives[1]} ofertas contigo.</p>
            
            <p><strong>🌟 Qué hay de ${style.adjectives[2]} esta Semana:</strong></p>
            <ul>
                ${products.slice(0, 3).map(product => `<li>${style.adjectives[3]} ${product} ahora disponible</li>`).join('')}
            </ul>
            
            <p><strong>🎉 Promociones ${style.adjectives[4]} Actuales:</strong></p>
            <ul>
                ${promotions.map(promo => `<li>${promo}</li>`).join('')}
            </ul>
            
            <p><strong>💡 Destacado del Cliente:</strong></p>
            <p>¡Gracias por ser parte de nuestra comunidad ${style.tone}! Tu continuo apoyo nos ayuda a crecer y servirte mejor.</p>
            
            <p><strong>📅 Próximos Eventos:</strong></p>
            <p>¡Mantente atento a eventos de fin de semana ${style.adjectives[0]} y días de apreciación a clientes!</p>
            
            <p><em>${style.callsToAction[1]} ${businessName} y déjanos servirte con excelencia!</em></p>
            <p>${style.closing},<br>El Equipo de ${businessName}</p>
        ` : `
            <p><strong>📧 Weekly Newsletter - ${businessName}</strong></p>
            <p>${style.greeting} Valued Customer,</p>
            <p>We hope this message finds you well! We're excited to share our ${style.adjectives[0]} updates and ${style.adjectives[1]} offers with you.</p>
            
            <p><strong>🌟 What's ${style.adjectives[2]} This Week:</strong></p>
            <ul>
                ${products.slice(0, 3).map(product => `<li>${style.adjectives[3]} ${product} now available</li>`).join('')}
            </ul>
            
            <p><strong>🎉 Current ${style.adjectives[4]} Promotions:</strong></p>
            <ul>
                ${promotions.map(promo => `<li>${promo}</li>`).join('')}
            </ul>
            
            <p><strong>💡 Customer Spotlight:</strong></p>
            <p>Thank you for being part of our ${style.tone} community! Your continued support helps us grow and serve you better.</p>
            
            <p><strong>📅 Upcoming Events:</strong></p>
            <p>Stay tuned for ${style.adjectives[0]} weekend events and customer appreciation days!</p>
            
            <p><em>${style.callsToAction[1]} ${businessName} and let us serve you with excellence!</em></p>
            <p>${style.closing},<br>The ${businessName} Team</p>
        `;

        return newsletter;
    }

    generateCampaignIdeas(language, businessName, socialMedia, communicationStyle, products, promotions) {
        const style = this.getStyleTemplates(communicationStyle, language);
        const campaigns = [
            {
                title: language === 'es' ? `🎯 Campaña 'Flash ${style.adjectives[0]}'` : `🎯 '${style.adjectives[0]} Flash' Campaign`,
                description: language === 'es' ? 
                    `Crea urgencia con ${promotions[0] || 'descuentos'} por tiempo limitado cada viernes. Promociona ${products[0] || 'productos destacados'} fuertemente en redes sociales con temporizadores de cuenta regresiva y mensajes ${style.tone}.` :
                    `Create urgency with limited-time ${promotions[0] || 'discounts'} every Friday. Promote ${products[0] || 'featured products'} heavily on social media with countdown timers and ${style.tone} messaging.`
            },
            {
                title: language === 'es' ? `📱 Campaña Social 'Comparte y Ahorra ${style.adjectives[1]}'` : `📱 '${style.adjectives[1]} Share & Save' Social Campaign`,
                description: language === 'es' ? 
                    `Anima a los clientes a compartir fotos con ${products.join(' o ')} y etiquetar tu negocio para tener la oportunidad de ganar ${style.adjectives[2]} ${promotions[1] || 'ofertas especiales'}. Usa hashtags ${style.hashtags[0]} y ${style.hashtags[1]}.` :
                    `Encourage customers to share photos with ${products.join(' or ')} and tag your business for a chance to win ${style.adjectives[2]} ${promotions[1] || 'special offers'}. Use ${style.hashtags[0]} and ${style.hashtags[1]} hashtags.`
            },
            {
                title: language === 'es' ? `🌟 Programa 'Cliente de la Semana ${style.adjectives[3]}'` : `🌟 '${style.adjectives[3]} Customer of the Week' Program`,
                description: language === 'es' ? 
                    `Destaca clientes leales en redes sociales, resalta sus ${products[0] || 'productos'} favoritos, y ofréceles ${style.adjectives[4]} ${promotions[0] || 'descuentos'} como aprecio. Mantenlo ${style.tone} y atractivo.` :
                    `Feature loyal customers on social media, highlight their favorite ${products[0] || 'products'}, and offer them ${style.adjectives[4]} ${promotions[0] || 'discounts'} as appreciation. Keep it ${style.tone} and engaging.`
            },
            {
                title: language === 'es' ? `🎉 Campaña 'Celebración Estacional ${style.adjectives[0]}'` : `🎉 '${style.adjectives[0]} Seasonal Celebration' Campaign`,
                description: language === 'es' ? 
                    `Crea promociones temáticas alrededor de holidays y temporadas, presentando ${products.slice(0, 2).join(' y ')} con ${style.adjectives[1]} ${promotions[1] || 'descuentos estacionales'}. Usa visuales y mensajes ${style.tone}.` :
                    `Create themed promotions around holidays and seasons, featuring ${products.slice(0, 2).join(' and ')} with ${style.adjectives[1]} ${promotions[1] || 'seasonal discounts'}. Use ${style.tone} visuals and messaging.`
            },
            {
                title: language === 'es' ? `🤝 Iniciativa 'Asociación Comunitaria ${style.adjectives[2]}'` : `🤝 '${style.adjectives[2]} Community Partnership' Initiative`,
                description: language === 'es' ? 
                    `Asociate con negocios locales para promocionar cruzadamente ${products[0] || 'productos'} y ofrecer ${style.adjectives[3]} ${promotions[0] || 'ofertas especiales'} combinadas a clientes compartidos. Construye una red comunitaria ${style.tone}.` :
                    `Partner with local businesses to cross-promote ${products[0] || 'products'} and offer combined ${style.adjectives[3]} ${promotions[0] || 'special deals'} to shared customers. Build a ${style.tone} community network.`
            }
        ];

        return `<ul>${campaigns.map(campaign => `<li><strong>${campaign.title}</strong><br>${campaign.description}</li>`).join('')}</ul>`;
    }

    generateAIEnhancedContent(language, businessType, socialMedia, format, communicationStyle, products, promotions, imageOption) {
        const businessTypeNames = {
            restaurant: language === 'es' ? 'Restaurante/Café' : language === 'ca' ? 'Restaurant/Cafè' : 'Restaurant/Café',
            retail: language === 'es' ? 'Tienda Minorista' : language === 'ca' ? 'Botiga Minorista' : 'Retail Store',
            service: language === 'es' ? 'Negocio de Servicios' : language === 'ca' ? 'Negoci de Serveis' : 'Service Business',
            beauty: language === 'es' ? 'Belleza/Salón' : language === 'ca' ? 'Bellesa/Saló' : 'Beauty/Salon',
            fitness: language === 'es' ? 'Fitness/Gimnasio' : language === 'ca' ? 'Fitness/Gimnàs' : 'Fitness/Gym',
            bakery: language === 'es' ? 'Panadería/Pastelería' : language === 'ca' ? 'Forn/Pastisseria' : 'Bakery/Pastry',
            grocery: language === 'es' ? 'Supermercado/Tienda de Alimentos' : language === 'ca' ? 'Supermercat/Botiga d\'Aliments' : 'Grocery Store/Food Shop',
            pharmacy: language === 'es' ? 'Farmacia' : language === 'ca' ? 'Farmàcia' : 'Pharmacy',
            petshop: language === 'es' ? 'Tienda de Mascotas/Veterinaria' : language === 'ca' ? 'Botiga de Mascotes/Veterinari' : 'Pet Shop/Veterinary',
            hardware: language === 'es' ? 'Ferretería' : language === 'ca' ? 'Ferreteria' : 'Hardware Store',
            flowers: language === 'es' ? 'Florería' : language === 'ca' ? 'Floristeria' : 'Flower Shop',
            butcher: language === 'es' ? 'Carnicería' : language === 'ca' ? 'Carnisseria' : 'Butcher Shop',
            fishmonger: language === 'es' ? 'Pescadería' : language === 'ca' ? 'Peixateria' : 'Fishmonger',
            stationery: language === 'es' ? 'Papelería' : language === 'ca' ? 'Papeteria' : 'Stationery Store',
            laundry: language === 'es' ? 'Lavandería' : language === 'ca' ? 'Bugaderia' : 'Laundry',
            shoes: language === 'es' ? 'Zapatería' : language === 'ca' ? 'Sabateria' : 'Shoe Store',
            books: language === 'es' ? 'Librería' : language === 'ca' ? 'Llibreria' : 'Bookstore',
            toys: language === 'es' ? 'Juguetería' : language === 'ca' ? 'Joguina' : 'Toy Store',
            jewelry: language === 'es' ? 'Joyería' : language === 'ca' ? 'Joieria' : 'Jewelry Store',
            optics: language === 'es' ? 'Óptica' : language === 'ca' ? 'Òptica' : 'Optics',
            other: language === 'es' ? 'Otro' : language === 'ca' ? 'Altres' : 'Other'
        };

        const businessName = businessTypeNames[businessType] || (language === 'es' ? 'Negocio' : language === 'ca' ? 'Negoci' : 'Business');
        const productsList = products.split(',').map(p => p.trim()).filter(p => p);
        const promotionsList = promotions.split(',').map(p => p.trim()).filter(p => p);
        
        const style = this.getStyleTemplates(communicationStyle, language);
        
        // Generate Gemini prompts for image creation
        const geminiPrompts = this.generateGeminiPrompts(language, businessName, socialMedia, style, productsList, promotionsList, imageOption);
        
        // Generate enhanced content
        const socialMediaContent = this.generateSocialMediaContent(language, businessName, socialMedia, format, communicationStyle, productsList, promotionsList);
        const productPromotion = this.generateProductPromotion(language, businessName, communicationStyle, productsList, promotionsList);
        const newsletterMessage = this.generateNewsletterMessage(language, businessName, communicationStyle, productsList, promotionsList);
        const campaignIdeas = this.generateCampaignIdeas(language, businessName, communicationStyle, productsList, promotionsList);
        const imageSuggestions = this.generateImageSuggestions(language, businessName, socialMedia, format, communicationStyle, productsList);

        return {
            geminiPrompts,
            socialMedia: socialMediaContent,
            imageSuggestions: imageSuggestions,
            productPromotion: productPromotion,
            newsletter: newsletterMessage,
            campaigns: campaignIdeas,
            businessName,
            socialMedia,
            style,
            productsList,
            promotionsList,
            imageOption
        };
    }

    generateGeminiPrompts(language, businessName, socialMedia, style, products, promotions, imageOption) {
        const basePrompts = [];
        
        // Instagram prompts
        if (socialMedia === 'instagram' || socialMedia === 'all') {
            basePrompts.push({
                platform: 'Instagram',
                format: 'Square Post (1:1)',
                prompt: language === 'es' ? 
                    `Crea una imagen profesional para Instagram de ${businessName}. Muestra ${products[0] || 'producto principal'} en un estilo ${style.adjectives[0]}. Fondo minimalista con colores ${style.adjectives[1]}. Iluminación profesional. Texto sutil: "${style.callsToAction[0]} ahora". Sin elementos distractivos. Estilo comercial atractivo.` :
                    language === 'ca' ?
                    `Crea una imatge professional per Instagram de ${businessName}. Mostra ${products[0] || 'producte principal'} en un estil ${style.adjectives[0]}. Fons minimalista amb colors ${style.adjectives[1]}. Il·luminació professional. Text subtil: "${style.callsToAction[0]} ara". Sense elements distractors. Estil comercial atractiu.` :
                    `Create a professional Instagram image for ${businessName}. Show ${products[0] || 'main product'} in a ${style.adjectives[0]} style. Minimalist background with ${style.adjectives[1]} colors. Professional lighting. Subtle text: "${style.callsToAction[0]} now". No distracting elements. Attractive commercial style.`,
                geminiUrl: 'https://gemini.google.com/app?hl=es-ES'
            });
            
            basePrompts.push({
                platform: 'Instagram',
                format: 'Story (9:16)',
                prompt: language === 'es' ? 
                    `Diseña una story vertical para Instagram de ${businessName}. Animación de ${products[0] || 'producto'} con efectos ${style.adjectives[2]}. Colores vibrantes pero profesionales. Texto grande: "${promotions[0] || 'OFERTA ESPECIAL'}". Elementos dinámicos. Duración 15 segundos.` :
                    language === 'ca' ?
                    `Dissenya una story vertical per Instagram de ${businessName}. Animació de ${products[0] || 'producte'} amb efectes ${style.adjectives[2]}. Colors vibrants però professionals. Text gran: "${promotions[0] || 'OFERTA ESPECIAL'}". Elements dinàmics. Durada 15 segons.` :
                    `Design a vertical Instagram story for ${businessName}. Animation of ${products[0] || 'product'} with ${style.adjectives[2]} effects. Vibrant but professional colors. Large text: "${promotions[0] || 'SPECIAL OFFER'}". Dynamic elements. 15 seconds duration.`,
                geminiUrl: 'https://gemini.google.com/app?hl=es-ES'
            });
        }
        
        // TikTok prompts
        if (socialMedia === 'tiktok' || socialMedia === 'all') {
            basePrompts.push({
                platform: 'TikTok',
                format: 'Vertical Video (9:16)',
                prompt: language === 'es' ? 
                    `Crea un video corto para TikTok mostrando ${products[0] || 'producto'} de ${businessName}. Estilo ${style.adjectives[3]} con música trendy. Transiciones rápidas. Texto animado: "¡${style.adjectives[4]} calidad!". Efectos de brillo. Formato vertical optimizado para móvil.` :
                    language === 'ca' ?
                    `Crea un video curt per TikTok mostrant ${products[0] || 'producte'} de ${businessName}. Estil ${style.adjectives[3]} amb música trendy. Transicions ràpides. Text animat: "¡${style.adjectives[4]} qualitat!". Efectes de brillantor. Format vertical optimitzat per mòbil.` :
                    `Create a short TikTok video showing ${products[0] || 'product'} from ${businessName}. ${style.adjectives[3]} style with trending music. Quick transitions. Animated text: "${style.adjectives[4]} quality!". Sparkle effects. Mobile-optimized vertical format.`,
                geminiUrl: 'https://gemini.google.com/app?hl=es-ES'
            });
        }
        
        // Facebook prompts
        if (socialMedia === 'facebook' || socialMedia === 'all') {
            basePrompts.push({
                platform: 'Facebook',
                format: 'Post Image (1200x630)',
                prompt: language === 'es' ? 
                    `Genera una imagen para Facebook de ${businessName}. Muestra ${products.slice(0, 2).join(' y ')} en un entorno ${style.tone}. Colores corporativos. Texto: "${promotions[0] || 'DESCUENTOS ESPECIALES'}". Estilo profesional pero accesible. Buen espacio para texto superpuesto.` :
                    language === 'ca' ?
                    `Genera una imatge per Facebook de ${businessName}. Mostra ${products.slice(0, 2).join(' i ')} en un entorn ${style.tone}. Colors corporatius. Text: "${promotions[0] || 'DESCOMPTE ESPECIAL'}". Estil professional però accessible. Bon espai per text superposat.` :
                    `Generate a Facebook image for ${businessName}. Show ${products.slice(0, 2).join(' and ')} in a ${style.tone} environment. Corporate colors. Text: "${promotions[0] || 'SPECIAL DISCOUNTS'}". Professional but accessible style. Good space for overlay text.`,
                geminiUrl: 'https://gemini.google.com/app?hl=es-ES'
            });
        }
        
        // X/Twitter prompts
        if (socialMedia === 'twitter' || socialMedia === 'all') {
            basePrompts.push({
                platform: 'X/Twitter',
                format: 'Header Image (1500x500)',
                prompt: language === 'es' ? 
                    `Crea una imagen para X/Twitter de ${businessName}. Diseño ${style.adjectives[0]} con ${products[0] || 'producto'} como elemento principal. Minimalista pero impactante. Texto corto: "Calidad ${style.adjectives[1]}". Alto contraste. Formato horizontal optimizado para la plataforma.` :
                    language === 'ca' ?
                    `Crea una imatge per X/Twitter de ${businessName}. Disseny ${style.adjectives[0]} amb ${products[0] || 'producte'} com a element principal. Minimalista però impactant. Text curt: "Qualitat ${style.adjectives[1]}". Alt contrast. Format horitzontal optimitzat per la plataforma.` :
                    `Create a X/Twitter image for ${businessName}. ${style.adjectives[0]} design with ${products[0] || 'product'} as main element. Minimalist but impactful. Short text: "${style.adjectives[1]} Quality". High contrast. Platform-optimized horizontal format.`,
                geminiUrl: 'https://gemini.google.com/app?hl=es-ES'
            });
        }
        
        return basePrompts;
    }

    generateCompletePost(language, businessName, socialMedia, communicationStyle, products, promotions) {
        const style = this.getStyleTemplates(communicationStyle, language);
        
        const themes = {
            motivation: language === 'es' ? 'motivación' : language === 'ca' ? 'motivació' : 'motivation',
            growth: language === 'es' ? 'crecimiento personal' : language === 'ca' ? 'creixement personal' : 'personal growth', 
            business: language === 'es' ? 'negocios online' : language === 'ca' ? 'negocis online' : 'online business',
            mindset: language === 'es' ? 'mentalidad' : language === 'ca' ? 'mentalitat' : 'mindset',
            productivity: language === 'es' ? 'productividad' : language === 'ca' ? 'productivitat' : 'productivity',
            tips: language === 'es' ? 'consejos prácticos' : language === 'ca' ? 'consells pràctics' : 'practical tips'
        };
        
        const selectedTheme = themes.motivation; // Default theme, could be randomized or selected
        
        const imagePrompts = {
            instagram: language === 'es' ? {
                prompt: `Imagen minimalista y moderna para Instagram, formato cuadrado 1:1. Fondo degradido suave con colores ${style.adjectives[0]}. Texto grande y centrado en fuente bold moderna: "EL ÉXITO EMPIEZA CON UN PASO". Elementos gráficos sutiles: línea ascendente y pequeño icono de cohete en esquina. Estilo profesional, limpio, con buena iluminación. Alto contraste para legibilidad. Sin elementos distractivos.`,
                imageText: "EL ÉXITO EMPIEZA CON UN PASO",
                caption: `💫 **${style.greeting.toUpperCase()}**! 🚀\n\nCada pequeño avance te acerca más a tus metas. 🎯\n\n${style.adjectives[0]} recordatorio: tu potencial no tiene límites. ✨\n\n¿Cuál es ese paso que darás hoy? 👇\n\n${style.callsToAction[0]} tu mejor versión. 💪\n\n${style.hashtags.slice(0, 3).join(' ')} #Motivación #Éxito #Crecimiento`,
                hashtags: ['#Motivación', '#Éxito', '#Crecimiento', '#Inspiración', '#Meta', style.hashtags[0]]
            } : language === 'ca' ? {
                prompt: `Imatge minimalista i moderna per Instagram, format quadrat 1:1. Fons degradat suau amb colors ${style.adjectives[0]}. Text gran i centrat en font bold moderna: "L'ÈXIT COMENÇA AMB UN PAS". Elements gràfics subtils: línia ascendent i petit icon de coet a la cantonada. Estil professional, net, amb bona il·luminació. Alt contrast per llegibilitat. Sense elements distractors.`,
                imageText: "L'ÈXIT COMENÇA AMB UN PAS",
                caption: `💫 **${style.greeting.toUpperCase()}**! 🚀\n\nCada petit avanç t'apropa més a les teves metes. 🎯\n\n${style.adjectives[0]} recordatori: el teu potencial no té límits. ✨\n\nQuin és aquest pas que faràs avui? 👇\n\n${style.callsToAction[0]} la teva millor versió. 💪\n\n${style.hashtags.slice(0, 3).join(' ')} #Motivació #Èxit #Creixement`,
                hashtags: ['#Motivació', '#Èxit', '#Creixement', '#Inspiració', '#Meta', style.hashtags[0]]
            } : {
                prompt: `Minimalist modern image for Instagram, square 1:1 format. Soft gradient background with ${style.adjectives[0]} colors. Large centered text in bold modern font: "SUCCESS STARTS WITH ONE STEP". Subtle graphic elements: ascending line and small rocket icon in corner. Professional, clean style with good lighting. High contrast for readability. No distracting elements.`,
                imageText: "SUCCESS STARTS WITH ONE STEP",
                caption: `💫 **${style.greeting.toUpperCase()}**! 🚀\n\nEvery small step brings you closer to your goals. 🎯\n\n${style.adjectives[0]} reminder: your potential has no limits. ✨\n\nWhat's that step you'll take today? 👇\n\n${style.callsToAction[0]} your best version. 💪\n\n${style.hashtags.slice(0, 3).join(' ')} #Motivation #Success #Growth`,
                hashtags: ['#Motivation', '#Success', '#Growth', '#Inspiration', '#Goals', style.hashtags[0]]
            }
        };

        const platformContent = imagePrompts[socialMedia] || imagePrompts.instagram;
        
        return `
            <div class="complete-post">
                <div class="post-theme">
                    <strong>🎯 ${language === 'es' ? 'Tema del post:' : language === 'ca' ? 'Tema del post:' : 'Post theme:'}</strong> ${selectedTheme}
                </div>
                
                <div class="image-prompt">
                    <strong>1️⃣ ${language === 'es' ? 'PROMPT DE IMAGEN:' : language === 'ca' ? 'PROMPT D\'IMATGE:' : 'IMAGE PROMPT:'}</strong>
                    <div class="prompt-content">${platformContent.prompt}</div>
                </div>
                
                <div class="image-text">
                    <strong>2️⃣ ${language === 'es' ? 'TEXTO EN LA IMAGEN:' : language === 'ca' ? 'TEXT A LA IMATGE:' : 'TEXT IN IMAGE:'}</strong>
                    <div class="text-content">"${platformContent.imageText}"</div>
                </div>
                
                <div class="caption">
                    <strong>3️⃣ CAPTION:</strong>
                    <div class="caption-content">${platformContent.caption}</div>
                </div>
                
                <div class="hashtags">
                    <strong>4️⃣ ${language === 'es' ? 'HASHTAGS:' : language === 'ca' ? 'HASHTAGS:' : 'HASHTAGS:'}</strong>
                    <div class="hashtags-content">${platformContent.hashtags.slice(0, 8).join(' ')}</div>
                </div>
                
                <div class="format-info">
                    <strong>📱 ${language === 'es' ? 'FORMATO:' : language === 'ca' ? 'FORMAT:' : 'FORMAT:'}</strong> 
                    ${socialMedia === 'instagram' ? 'Instagram (1:1)' : 
                      socialMedia === 'tiktok' ? 'TikTok (9:16)' : 
                      socialMedia === 'twitter' ? 'X/Twitter (16:9)' : 
                      'Social Media Optimized'}
                </div>
                
                <div class="engagement-tips">
                    <strong>💡 ${language === 'es' ? 'CONSEJOS PARA ENGAGEMENT:' : language === 'ca' ? 'CONSELLS PER A L\'ENGAGEMENT:' : 'ENGAGEMENT TIPS:'}</strong>
                    <ul>
                        <li>${language === 'es' ? 'Publica en horas pico de tu audiencia' : language === 'ca' ? 'Publica en hores pic de la teva audiència' : 'Post during your audience peak hours'}</li>
                        <li>${language === 'es' ? 'Usa emojis relevantes para aumentar visibilidad' : language === 'ca' ? 'Usa emojis rellevants per augmentar visibilitat' : 'Use relevant emojis to increase visibility'}</li>
                        <li>${language === 'es' ? 'Responde a todos los comentarios rápidamente' : language === 'ca' ? 'Respon a tots els comentaris ràpidament' : 'Respond to all comments quickly'}</li>
                        <li>${language === 'es' ? 'Añade llamada a la acción clara' : language === 'ca' ? 'Afegeix crida a l\'acció clara' : 'Add clear call-to-action'}</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showLoadingState() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="loading">
                <p>🤖 ${language === 'es' ? 'Generando tu contenido de marketing personalizado...' : 'Generating your personalized marketing content...'}</p>
                <p>${language === 'es' ? 'Esto puede tomar un momento...' : 'This may take a moment...'}</p>
            </div>
        `;
    }

    displayResults(content, language) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        resultsSection.innerHTML = `
            <div class="results-header">
                <h2 class="results-title">
                    <span class="title-icon">🚀</span>
                    ${language === 'es' ? 'Contenido de Marketing LocalBoost IA' : language === 'ca' ? 'Contingut de Marketing LocalBoost IA' : 'LocalBoost IA Marketing Content Generated'}
                </h2>
                <p class="results-subtitle">
                    ${language === 'es' ? 'Tu contenido profesional está listo para usar' : language === 'ca' ? 'El teu contingut professional està llest per usar' : 'Your professional content is ready to use'}
                </p>
            </div>
            
            <div class="results-grid">
                <div class="result-card ai-prompts-card">
                    <div class="card-header">
                        <div class="card-icon">🤖</div>
                        <div class="card-title-group">
                            <h3 class="card-title">${language === 'es' ? 'Prompts IA para Gemini' : language === 'ca' ? 'Prompts IA per Gemini' : 'AI Prompts for Gemini'}</h3>
                            <p class="card-subtitle">${language === 'es' ? 'Optimiza tu contenido con IA' : language === 'ca' ? 'Optimitza el teu contingut amb IA' : 'Optimize your content with AI'}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="prompts-list">
                            ${content.geminiPrompts.map((prompt, index) => `
                                <div class="prompt-item">
                                    <div class="prompt-header">
                                        <span class="platform-badge">
                                            ${this.getPlatformIcon(prompt.platform)}
                                            ${prompt.platform}
                                        </span>
                                        <span class="format-badge">${prompt.format}</span>
                                    </div>
                                    <div class="prompt-content">
                                        <div class="prompt-text">${prompt.prompt}</div>
                                        <button class="copy-prompt-btn" data-prompt="${prompt.prompt.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">
                                            <span class="btn-icon">📋</span>
                                            <span class="btn-text">${language === 'es' ? 'Copiar' : language === 'ca' ? 'Copiar' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="result-card suggestions-card">
                    <div class="card-header">
                        <div class="card-icon">🖼️</div>
                        <div class="card-title-group">
                            <h3 class="card-title">${language === 'es' ? 'Sugerencias de Imágenes' : language === 'ca' ? 'Suggeriments d\'Imatges' : 'Image Suggestions'}</h3>
                            <p class="card-subtitle">${language === 'es' ? 'Ideas visuales para tu contenido' : language === 'ca' ? 'Idees visuals per al teu contingut' : 'Visual ideas for your content'}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="suggestions-content">
                            ${content.imageSuggestions}
                        </div>
                    </div>
                </div>

                <div class="result-card promotion-card">
                    <div class="card-header">
                        <div class="card-icon">🏆</div>
                        <div class="card-title-group">
                            <h3 class="card-title">${language === 'es' ? 'Texto de Promoción' : language === 'ca' ? 'Text de Promoció' : 'Promotion Text'}</h3>
                            <p class="card-subtitle">${language === 'es' ? 'Contenido para promociones especiales' : language === 'ca' ? 'Contingut per promocions especials' : 'Content for special promotions'}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="promotion-content">
                            ${content.productPromotion}
                        </div>
                    </div>
                </div>

                <div class="result-card newsletter-card">
                    <div class="card-header">
                        <div class="card-icon">📧</div>
                        <div class="card-title-group">
                            <h3 class="card-title">${language === 'es' ? 'Newsletter' : language === 'ca' ? 'Newsletter' : 'Newsletter'}</h3>
                            <p class="card-subtitle">${language === 'es' ? 'Contenido para email marketing' : language === 'ca' ? 'Contingut per email marketing' : 'Content for email marketing'}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="newsletter-content">
                            ${content.newsletter}
                        </div>
                    </div>
                </div>

                <div class="result-card campaigns-card">
                    <div class="card-header">
                        <div class="card-icon">🎯</div>
                        <div class="card-title-group">
                            <h3 class="card-title">${language === 'es' ? 'Ideas de Campaña' : language === 'ca' ? 'Idees de Campanya' : 'Campaign Ideas'}</h3>
                            <p class="card-subtitle">${language === 'es' ? 'Estrategias de marketing creativas' : language === 'ca' ? 'Estratègies de màrqueting creatives' : 'Creative marketing strategies'}</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="campaigns-content">
                            ${content.campaignIdeas}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="results-actions">
                <button id="generateNewBtn" class="action-btn primary-btn">
                    <span class="btn-icon">🔄</span>
                    <span class="btn-text">${language === 'es' ? 'Generar Nuevo Contenido' : language === 'ca' ? 'Generar Nou Contingut' : 'Generate New Content'}</span>
                </button>
                <button id="toggleCalendarBtn" class="action-btn secondary-btn">
                    <span class="btn-icon">📅</span>
                    <span class="btn-text">${language === 'es' ? 'Ver Calendario' : language === 'ca' ? 'Veure Calendari' : 'View Calendar'}</span>
                </button>
                <button id="toggleImageGeneratorBtn" class="action-btn secondary-btn">
                    <span class="btn-icon">🎨</span>
                    <span class="btn-text">${language === 'es' ? 'Generador de Imágenes' : language === 'ca' ? 'Generador d\'Imatges' : 'Image Generator'}</span>
                </button>
            </div>
        `;
        
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        this.addContentToCalendar(content);
        this.addImageToGallery(content);
    }

    displayAIEnhancedResults(content, language) {
        const resultsSection = document.getElementById('resultsSection');
        
        resultsSection.innerHTML = `
            <h2>${language === 'es' ? 'Contenido Mejorado con IA Generado' : language === 'ca' ? 'Contingut Millorat amb IA Generat' : 'AI Enhanced Content Generated'}</h2>
            
            <div class="content-card ai-enhanced-card">
                <h3><span>🤖</span> ${language === 'es' ? 'Prompts para Gemini' : language === 'ca' ? 'Prompts per Gemini' : 'Gemini Prompts'}</h3>
                <div class="gemini-prompts">
                    ${content.geminiPrompts.map((prompt, index) => `
                        <div class="prompt-item">
                            <h4>📱 ${prompt.platform} - ${prompt.format}</h4>
                            <div class="prompt-text">${prompt.prompt}</div>
                            <button class="gemini-btn" onclick="window.open('${prompt.geminiUrl}', '_blank')">
                                🎨 ${language === 'es' ? 'Abrir Gemini' : language === 'ca' ? 'Obrir Gemini' : 'Open Gemini'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="content-card">
                <h3><span>📱</span> ${language === 'es' ? 'Contenido para Redes Sociales' : language === 'ca' ? 'Contingut per Xarxes Socials' : 'Social Media Content'}</h3>
                <div>${content.socialMedia}</div>
            </div>

            <div class="content-card">
                <h3><span>🖼️</span> ${language === 'es' ? 'Sugerencias de Imágenes' : language === 'ca' ? 'Suggeriments d\'Imatges' : 'Image Suggestions'}</h3>
                <div>${content.imageSuggestions}</div>
            </div>

            <div class="content-card">
                <h3><span>🏆</span> ${language === 'es' ? 'Texto de Promoción de Productos' : language === 'ca' ? 'Text de Promoció de Productes' : 'Product Promotion Text'}</h3>
                <div>${content.productPromotion}</div>
            </div>

            <div class="content-card">
                <h3><span>📧</span> ${language === 'es' ? 'Mensaje para Boletín de Clientes' : language === 'ca' ? 'Missatge per Butlletí de Clients' : 'Customer Newsletter Message'}</h3>
                <div>${content.newsletter}</div>
            </div>

            <div class="content-card">
                <h3><span>🎯</span> ${language === 'es' ? 'Ideas de Campaña Promocional' : language === 'ca' ? 'Idees de Campanya Promocional' : 'Promotional Campaign Ideas'}</h3>
                <div>${content.campaigns}</div>
            </div>

            <button id="generateNewBtn" class="generate-btn">
                <span>🔄</span> ${language === 'es' ? 'Generar Nuevo Contenido' : language === 'ca' ? 'Generar Nou Contingut' : 'Generate New Content'}
            </button>
        `;

        this.initEventListeners();
        
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
        `;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    // Calendar Functions
    switchView(view) {
        this.currentView = view;
        
        // Update button states
        const weekBtn = document.getElementById('weekViewBtn');
        const monthBtn = document.getElementById('monthViewBtn');
        
        if (weekBtn && monthBtn) {
            weekBtn.classList.toggle('active', view === 'week');
            monthBtn.classList.toggle('active', view === 'month');
        }
        
        this.renderCalendar();
    }

    navigateCalendar(direction) {
        if (direction === 'prev') {
            if (this.currentView === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
            } else {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            }
        } else {
            if (this.currentView === 'week') {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
            } else {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            }
        }
        
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentDateSpan = document.getElementById('currentDate');
        
        if (!calendarGrid || !currentDateSpan) return;
        
        if (this.currentView === 'week') {
            this.renderWeekView(calendarGrid, currentDateSpan);
        } else {
            this.renderMonthView(calendarGrid, currentDateSpan);
        }
    }

    renderWeekView(grid, dateSpan) {
        const startOfWeek = new Date(this.currentDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);
        
        dateSpan.textContent = this.formatWeekRange(startOfWeek);
        
        let html = '';
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekDaysEs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const weekDaysCa = ['Diu', 'Dill', 'Dim', 'Dij', 'Div', 'Dis', 'Diss'];
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            const dateKey = this.getDateKey(currentDate);
            const dayContent = this.calendarData[dateKey] || [];
            
            html += `
                <div class="calendar-day">
                    <div class="calendar-day-header">
                        <div class="calendar-day-title">${weekDays[i]}</div>
                        <div class="calendar-day-date">${currentDate.getDate()}/${currentDate.getMonth() + 1}</div>
                    </div>
                    <div class="calendar-content">
                        ${dayContent.map(item => this.renderContentItem(item)).join('')}
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = html;
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    }

    renderMonthView(grid, dateSpan) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        dateSpan.textContent = this.formatMonthYear(year, month);
        
        let html = '';
        const totalDays = 42; // 6 weeks * 7 days
        
        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateKey = this.getDateKey(currentDate);
            const dayContent = this.calendarData[dateKey] || [];
            const isCurrentMonth = currentDate.getMonth() === month;
            const opacity = isCurrentMonth ? '1' : '0.3';
            
            html += `
                <div class="calendar-day" style="opacity: ${opacity}">
                    <div class="calendar-day-header">
                        <div class="calendar-day-title">${currentDate.getDate()}</div>
                        <div class="calendar-day-date">${currentDate.getMonth() + 1}/${currentDate.getDate()}</div>
                    </div>
                    <div class="calendar-content">
                        ${dayContent.slice(0, 2).map(item => this.renderContentItem(item)).join('')}
                        ${dayContent.length > 2 ? `<div class="content-item">+${dayContent.length - 2} more</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = html;
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    }

    renderContentItem(item) {
        const platformIcons = {
            instagram: '📷',
            facebook: '📘',
            tiktok: '🎵',
            linkedin: '💼',
            twitter: '🐦',
            blog: '🌐'
        };
        
        return `
            <div class="content-item" onclick="this.classList.toggle('expanded')">
                <div class="content-platform">${platformIcons[item.platform] || '📱'} ${item.platform}</div>
                <div class="content-preview">${item.content.substring(0, 60)}...</div>
                <div class="content-time">${item.time || 'All day'}</div>
            </div>
        `;
    }

    formatWeekRange(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
    }

    formatMonthYear(year, month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month] + ' ' + year;
    }

    getDateKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    addContentToCalendar(content) {
        const today = new Date();
        const dateKey = this.getDateKey(today);
        
        if (!this.calendarData[dateKey]) {
            this.calendarData[dateKey] = [];
        }
        
        this.calendarData[dateKey].push({
            platform: content.socialMedia,
            content: content.socialMedia.substring(0, 100),
            time: new Date().toLocaleTimeString(),
            fullContent: content
        });
        
        this.saveCalendar();
        this.showCalendar();
    }

    showCalendar() {
        const calendarSection = document.getElementById('calendarSection');
        if (calendarSection) {
            calendarSection.style.display = 'block';
            this.renderCalendar();
        }
    }

    saveCalendar() {
        localStorage.setItem('localBoostCalendar', JSON.stringify(this.calendarData));
    }

    exportCalendar() {
        const csvContent = this.generateCalendarCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `localboost-calendar-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCalendarCSV() {
        let csv = 'Date,Platform,Content,Time\n';
        
        Object.keys(this.calendarData).forEach(dateKey => {
            this.calendarData[dateKey].forEach(item => {
                csv += `"${dateKey}","${item.platform}","${item.content.replace(/"/g, '""')}","${item.time}"\n`;
            });
        });
        
        return csv;
    }

    clearCalendar() {
        if (confirm('Are you sure you want to clear all calendar data? / ¿Estás seguro de que quieres limpiar todos los datos del calendario?')) {
            this.calendarData = {};
            this.saveCalendar();
            this.renderCalendar();
            this.showAlert('Calendar cleared successfully / Calendario limpiado exitosamente');
        }
    }

    // Image Generator Functions
    showImageGenerator() {
        const imageGeneratorSection = document.getElementById('imageGeneratorSection');
        if (imageGeneratorSection) {
            imageGeneratorSection.style.display = 'block';
            this.renderImageGallery();
        }
    }

    generateImage() {
        const prompt = document.getElementById('imagePrompt').value.trim();
        const style = document.getElementById('imageStyle').value;
        const format = document.getElementById('imageFormat').value;
        
        if (!prompt) {
            this.showAlert('Please enter an image prompt / Por favor ingresa un prompt de imagen');
            return;
        }
        
        this.showImageLoadingSpinner();
        
        // Simulate image generation (in real implementation, this would call Gemini API)
        setTimeout(() => {
            this.generateMockImage(prompt, style, format);
        }, 2000);
    }

    showImageLoadingSpinner() {
        const spinner = document.getElementById('imageLoadingSpinner');
        const resultContainer = document.getElementById('generatedImageContainer');
        
        if (spinner) spinner.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
    }

    hideImageLoadingSpinner() {
        const spinner = document.getElementById('imageLoadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }

    generateMockImage(prompt, style, format) {
        // Create a canvas-based AI-like image generation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on format
        const sizes = {
            square: [512, 512],
            portrait: [512, 912],
            landscape: [912, 512],
            wide: [1072, 512]
        };
        
        const [width, height] = sizes[format] || sizes.square;
        canvas.width = width;
        canvas.height = height;
        
        // Create AI-like sophisticated background
        this.createAIBackground(ctx, width, height, prompt, style);
        
        // Generate AI-like visual elements
        this.generateAIVisuals(ctx, width, height, prompt, style);
        
        // Add AI-like text rendering
        this.addAIText(ctx, width, height, prompt, style);
        
        // Add AI-like post-processing effects
        this.addAIEffects(ctx, width, height, style);
        
        // Convert to data URL
        const imageUrl = canvas.toDataURL('image/png');
        
        this.displayGeneratedImage(imageUrl, prompt, style, format);
        this.hideImageLoadingSpinner();
    }

    createAIBackground(ctx, width, height, prompt, style) {
        // AI-like background generation with multiple layers
        const businessContext = this.getBusinessContext();
        
        // Create complex gradient background
        const gradient1 = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        const gradient2 = ctx.createLinearGradient(0, 0, width, height);
        
        // AI-chosen colors based on prompt analysis
        const colors = this.analyzePromptColors(prompt, style);
        
        gradient1.addColorStop(0, colors.primary + 'FF');
        gradient1.addColorStop(0.7, colors.secondary + 'CC');
        gradient1.addColorStop(1, colors.tertiary + '88');
        
        gradient2.addColorStop(0, colors.primary + '33');
        gradient2.addColorStop(1, colors.secondary + '33');
        
        // Apply gradients
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, width, height);
        
        // Add AI-like texture overlay
        this.addAITexture(ctx, width, height, style);
        
        // Add AI-like lighting effects
        this.addAILighting(ctx, width, height, colors);
    }

    analyzePromptColors(prompt, style) {
        // AI-like color analysis based on prompt keywords
        const lowerPrompt = prompt.toLowerCase();
        
        // Business-specific color palettes
        const businessColors = {
            restaurant: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#45B7D1' },
            retail: { primary: '#667EEA', secondary: '#764BA2', tertiary: '#F093FB' },
            beauty: { primary: '#FF6B9D', secondary: '#C44569', tertiary: '#F8B500' },
            fitness: { primary: '#4ECDC4', secondary: '#44A08D', tertiary: '#093637' },
            bakery: { primary: '#D4A574', secondary: '#8B4513', tertiary: '#FFE5B4' },
            service: { primary: '#3498DB', secondary: '#2980B9', tertiary: '#5DADE2' }
        };
        
        // Style-specific color modifications
        const styleModifiers = {
            realistic: { brightness: 1, saturation: 0.8 },
            artistic: { brightness: 1.1, saturation: 1.2 },
            cartoon: { brightness: 1.2, saturation: 1.5 },
            minimalist: { brightness: 0.9, saturation: 0.6 },
            vintage: { brightness: 0.8, saturation: 0.7 }
        };
        
        const businessType = this.getBusinessContext().businessType || 'retail';
        let colors = businessColors[businessType] || businessColors.retail;
        
        // Apply style modifications
        const modifier = styleModifiers[style] || styleModifiers.realistic;
        
        return {
            primary: this.adjustColorBrightness(colors.primary, modifier.brightness),
            secondary: this.adjustColorBrightness(colors.secondary, modifier.brightness),
            tertiary: this.adjustColorBrightness(colors.tertiary, modifier.brightness)
        };
    }

    adjustColorBrightness(color, factor) {
        // Simple brightness adjustment
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.min(255, Math.floor(r * factor));
        const newG = Math.min(255, Math.floor(g * factor));
        const newB = Math.min(255, Math.floor(b * factor));
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    addAITexture(ctx, width, height, style) {
        ctx.globalAlpha = 0.1;
        
        // AI-like procedural texture generation
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 30 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            
            // Random color from palette
            const colors = ['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }

    addAILighting(ctx, width, height, colors) {
        // AI-like lighting effects
        const lightGradient = ctx.createRadialGradient(
            width * 0.3, height * 0.3, 0,
            width * 0.3, height * 0.3, Math.max(width, height) * 0.8
        );
        
        lightGradient.addColorStop(0, colors.primary + '44');
        lightGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add rim lighting
        const rimGradient = ctx.createLinearGradient(0, 0, width, height);
        rimGradient.addColorStop(0, 'transparent');
        rimGradient.addColorStop(0.5, colors.tertiary + '22');
        rimGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = rimGradient;
        ctx.fillRect(0, 0, width, height);
    }

    generateAIVisuals(ctx, width, height, prompt, style) {
        // AI-like visual element generation
        const businessType = this.getBusinessContext().businessType || 'retail';
        
        // Generate AI-like shapes and patterns
        this.generateAIPatterns(ctx, width, height, businessType, style);
        
        // Add AI-like business icons
        this.addAIIcons(ctx, width, height, businessType, style);
        
        // Add AI-like decorative elements
        this.addAIDecorations(ctx, width, height, style);
    }

    generateAIPatterns(ctx, width, height, businessType, style) {
        ctx.globalAlpha = 0.15;
        
        // AI-like pattern generation based on business type
        const patterns = {
            restaurant: () => this.drawFoodPattern(ctx, width, height),
            retail: () => this.drawShoppingPattern(ctx, width, height),
            beauty: () => this.drawBeautyPattern(ctx, width, height),
            fitness: () => this.drawFitnessPattern(ctx, width, height),
            bakery: () => this.drawBakeryPattern(ctx, width, height),
            service: () => this.drawServicePattern(ctx, width, height)
        };
        
        const patternFunction = patterns[businessType] || patterns.retail;
        patternFunction();
        
        ctx.globalAlpha = 1;
    }

    drawFoodPattern(ctx, width, height) {
        // Draw food-related patterns
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 20 + 10;
            
            // Draw circular food elements
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = '#FF6B6B';
            ctx.fill();
            
            // Add highlight
            ctx.beginPath();
            ctx.arc(x - size/3, y - size/3, size/3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF88';
            ctx.fill();
        }
    }

    drawShoppingPattern(ctx, width, height) {
        // Draw shopping-related patterns
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 30 + 15;
            
            // Draw bag shapes
            ctx.fillStyle = '#667EEA';
            ctx.fillRect(x - size/2, y - size/2, size, size);
            
            // Add handle
            ctx.strokeStyle = '#667EEA';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y - size/2, size/3, Math.PI, 0);
            ctx.stroke();
        }
    }

    drawBeautyPattern(ctx, width, height) {
        // Draw beauty-related patterns
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 15 + 8;
            
            // Draw circular beauty elements
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = '#FF6B9D';
            ctx.fill();
            
            // Add sparkle effect
            ctx.fillStyle = '#FFFFFFAA';
            ctx.beginPath();
            ctx.arc(x + size/3, y - size/3, size/4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFitnessPattern(ctx, width, height) {
        // Draw fitness-related patterns
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 25 + 15;
            
            // Draw dumbbell shapes
            ctx.fillStyle = '#4ECDC4';
            ctx.fillRect(x - size/2, y - size/8, size/3, size/4);
            ctx.fillRect(x + size/6, y - size/8, size/3, size/4);
            ctx.fillRect(x - size/8, y - size/2, size/4, size);
        }
    }

    drawBakeryPattern(ctx, width, height) {
        // Draw bakery-related patterns
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 20 + 10;
            
            // Draw bread shapes
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x - size/2, y - size/3, size, size/1.5);
            
            // Add texture lines
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                ctx.moveTo(x - size/2 + 5, y - size/3 + j * 5);
                ctx.lineTo(x + size/2 - 5, y - size/3 + j * 5);
                ctx.stroke();
            }
        }
    }

    drawServicePattern(ctx, width, height) {
        // Draw service-related patterns
        for (let i = 0; i < 7; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 20 + 10;
            
            // Draw star shapes
            ctx.fillStyle = '#3498DB';
            this.drawStar(ctx, x, y, 5, size, size/2);
        }
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    addAIIcons(ctx, width, height, businessType, style) {
        ctx.globalAlpha = 0.6;
        
        // Business-specific AI icons
        const iconSets = {
            restaurant: ['🍽️', '🥘', '🍰', '☕', '🍕', '🍔'],
            retail: ['🛍️', '📦', '🏷️', '💳', '🛒', '🎁'],
            beauty: ['💄', '💅', '🧴', '✨', '💇', '💆'],
            fitness: ['💪', '🏋️', '🏃', '🧘', '⚡', '🎯'],
            bakery: ['🥐', '🍞', '🧁', '🥖', '🥨', '🍪'],
            service: ['📞', '💼', '🤝', '⭐', '📈', '🎯']
        };
        
        const icons = iconSets[businessType] || iconSets.retail;
        
        // Add floating icons with AI-like positioning
        for (let i = 0; i < 6; i++) {
            const icon = icons[i % icons.length];
            const x = (width / 7) * (i + 1);
            const y = height / 2 + Math.sin(i) * 50;
            const size = 25 + Math.sin(i * 0.5) * 10;
            
            ctx.font = `${size}px Arial`;
            ctx.fillText(icon, x, y);
        }
        
        ctx.globalAlpha = 1;
    }

    addAIDecorations(ctx, width, height, style) {
        ctx.globalAlpha = 0.2;
        
        // Style-specific AI decorations
        switch(style) {
            case 'artistic':
                this.drawArtisticElements(ctx, width, height);
                break;
            case 'minimalist':
                this.drawMinimalistElements(ctx, width, height);
                break;
            case 'vintage':
                this.drawVintageElements(ctx, width, height);
                break;
            case 'cartoon':
                this.drawCartoonElements(ctx, width, height);
                break;
            case 'realistic':
                this.drawRealisticElements(ctx, width, height);
                break;
        }
        
        ctx.globalAlpha = 1;
    }

    drawArtisticElements(ctx, width, height) {
        // Abstract artistic shapes
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            
            for (let j = 0; j < 3; j++) {
                ctx.bezierCurveTo(
                    Math.random() * width, Math.random() * height,
                    Math.random() * width, Math.random() * height,
                    Math.random() * width, Math.random() * height
                );
            }
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawMinimalistElements(ctx, width, height) {
        // Clean geometric shapes
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 30 + 10;
            
            ctx.strokeRect(x, y, size, size);
        }
    }

    drawVintageElements(ctx, width, height) {
        // Vintage ornamental elements
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        
        // Draw vintage frame corners
        const margin = 30;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin + 50, margin);
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + 50);
        
        ctx.moveTo(width - margin, margin);
        ctx.lineTo(width - margin - 50, margin);
        ctx.moveTo(width - margin, margin);
        ctx.lineTo(width - margin, margin + 50);
        
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(margin + 50, height - margin);
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(margin, height - margin - 50);
        
        ctx.moveTo(width - margin, height - margin);
        ctx.lineTo(width - margin - 50, height - margin);
        ctx.moveTo(width - margin, height - margin);
        ctx.lineTo(width - margin, height - margin - 50);
        
        ctx.stroke();
    }

    drawCartoonElements(ctx, width, height) {
        // Fun cartoon elements
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 15 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            
            // Add cartoon eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x - radius/3, y - radius/3, 2, 0, Math.PI * 2);
            ctx.arc(x + radius/3, y - radius/3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawRealisticElements(ctx, width, height) {
        // Realistic lighting and shadows
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    addAIText(ctx, width, height, prompt, style) {
        // AI-like text rendering with sophisticated typography
        const textStyles = {
            realistic: { font: 'Inter', weight: '600', size: 32, color: '#FFFFFF' },
            artistic: { font: 'Georgia', weight: 'italic', size: 36, color: '#FFFFFF' },
            cartoon: { font: 'Comic Sans MS', weight: 'bold', size: 34, color: '#FFFFFF' },
            minimalist: { font: 'Helvetica', weight: '300', size: 30, color: '#FFFFFF' },
            vintage: { font: 'Times New Roman', weight: 'bold', size: 33, color: '#FFFFFF' }
        };
        
        const textStyle = textStyles[style] || textStyles.realistic;
        
        // Add sophisticated text rendering
        ctx.font = `${textStyle.weight} ${textStyle.size}px ${textStyle.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Smart text wrapping
        const words = prompt.split(' ');
        const lines = [];
        let currentLine = '';
        const maxWidth = width - 80;
        
        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);
        
        // Draw text with proper spacing
        const lineHeight = textStyle.size + 12;
        const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillStyle = textStyle.color;
            ctx.fillText(line, width / 2, startY + index * lineHeight);
        });
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    addAIEffects(ctx, width, height, style) {
        // AI-like post-processing effects
        
        // Add vignette effect
        const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(0.7, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        
        // Add noise texture for realism
        this.addNoiseTexture(ctx, width, height);
        
        // Add style-specific effects
        switch(style) {
            case 'vintage':
                this.addVintageFilter(ctx, width, height);
                break;
            case 'artistic':
                this.addArtisticFilter(ctx, width, height);
                break;
            case 'cartoon':
                this.addCartoonFilter(ctx, width, height);
                break;
        }
    }

    addNoiseTexture(ctx, width, height) {
        ctx.globalAlpha = 0.05;
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            
            ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
            ctx.fillRect(x, y, size, size);
        }
        
        ctx.globalAlpha = 1;
    }

    addVintageFilter(ctx, width, height) {
        ctx.globalAlpha = 0.2;
        
        // Add sepia tone
        const sepia = ctx.createLinearGradient(0, 0, width, height);
        sepia.addColorStop(0, '#8B4513');
        sepia.addColorStop(1, '#D4A574');
        
        ctx.fillStyle = sepia;
        ctx.fillRect(0, 0, width, height);
        
        ctx.globalAlpha = 1;
    }

    addArtisticFilter(ctx, width, height) {
        ctx.globalAlpha = 0.1;
        
        // Add color overlay
        const overlay = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        overlay.addColorStop(0, '#FF00FF');
        overlay.addColorStop(1, '#00FFFF');
        
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
        
        ctx.globalAlpha = 1;
    }

    addCartoonFilter(ctx, width, height) {
        ctx.globalAlpha = 0.1;
        
        // Add bright color overlay
        const overlay = ctx.createLinearGradient(0, 0, width, height);
        overlay.addColorStop(0, '#FFD700');
        overlay.addColorStop(0.5, '#FF69B4');
        overlay.addColorStop(1, '#00CED1');
        
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
        
        ctx.globalAlpha = 1;
    }

    getStyleColors(style) {
        const colorPalettes = {
            realistic: ['#4F46E5', '#7C3AED'],
            artistic: ['#EC4899', '#F59E0B'],
            cartoon: ['#10B981', '#3B82F6'],
            minimalist: ['#6B7280', '#374151'],
            vintage: ['#DC2626', '#EA580C']
        };
        
        return colorPalettes[style] || colorPalettes.realistic;
    }

    displayGeneratedImage(imageUrl, prompt, style, format) {
        const resultContainer = document.getElementById('generatedImageContainer');
        const generatedImage = document.getElementById('generatedImage');
        
        if (generatedImage && resultContainer) {
            generatedImage.src = imageUrl;
            resultContainer.style.display = 'block';
            
            // Store current image data
            this.currentGeneratedImage = {
                url: imageUrl,
                prompt,
                style,
                format,
                timestamp: new Date().toISOString()
            };
            
            // Add to gallery
            this.addToImageGallery(this.currentGeneratedImage);
        }
    }

    addToImageGallery(imageData) {
        this.imageGallery.unshift(imageData);
        
        // Keep only last 12 images
        if (this.imageGallery.length > 12) {
            this.imageGallery = this.imageGallery.slice(0, 12);
        }
        
        this.saveImageGallery();
        this.renderImageGallery();
    }

    saveImageGallery() {
        localStorage.setItem('localBoostImageGallery', JSON.stringify(this.imageGallery));
    }

    renderImageGallery() {
        const galleryGrid = document.getElementById('imageGalleryGrid');
        if (!galleryGrid) return;
        
        if (this.imageGallery.length === 0) {
            galleryGrid.innerHTML = '<div class="empty-gallery">No images generated yet / No hay imágenes generadas aún</div>';
            return;
        }
        
        galleryGrid.innerHTML = this.imageGallery.map((image, index) => `
            <div class="gallery-item" onclick="this.selectImage(${index})">
                <img src="${image.url}" alt="Generated image ${index + 1}">
                <div class="gallery-item-info">
                    ${image.prompt.substring(0, 30)}...
                </div>
            </div>
        `).join('');
    }

    clearImageGenerator() {
        const promptInput = document.getElementById('imagePrompt');
        const resultContainer = document.getElementById('generatedImageContainer');
        
        if (promptInput) promptInput.value = '';
        if (resultContainer) resultContainer.style.display = 'none';
        
        this.currentGeneratedImage = null;
    }

    downloadGeneratedImage() {
        if (!this.currentGeneratedImage) {
            this.showAlert('No image to download / No hay imagen para descargar');
            return;
        }
        
        const link = document.createElement('a');
        link.href = this.currentGeneratedImage.url;
        link.download = `localboost-image-${Date.now()}.png`;
        link.click();
    }

    addImageToCalendar() {
        if (!this.currentGeneratedImage) {
            this.showAlert('No image to add to calendar / No hay imagen para agregar al calendario');
            return;
        }
        
        const today = new Date();
        const dateKey = this.getDateKey(today);
        
        if (!this.calendarData[dateKey]) {
            this.calendarData[dateKey] = [];
        }
        
        this.calendarData[dateKey].push({
            platform: 'image',
            content: `Generated Image: ${this.currentGeneratedImage.prompt}`,
            time: new Date().toLocaleTimeString(),
            fullContent: this.currentGeneratedImage,
            type: 'image'
        });
        
        this.saveCalendar();
        this.showCalendar();
        this.showAlert('Image added to calendar / Imagen agregada al calendario');
    }

    regenerateImage() {
        if (!this.currentGeneratedImage) {
            this.showAlert('No image to regenerate / No hay imagen para regenerar');
            return;
        }
        
        // Use the same prompt, style, and format
        document.getElementById('imagePrompt').value = this.currentGeneratedImage.prompt;
        document.getElementById('imageStyle').value = this.currentGeneratedImage.style;
        document.getElementById('imageFormat').value = this.currentGeneratedImage.format;
        
        this.generateImage();
    }

    // Chatbot Functions
    toggleChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        const chatbotToggle = document.getElementById('chatbotToggle');
        
        if (chatbotWindow) {
            const isActive = chatbotWindow.classList.contains('active');
            
            if (isActive) {
                chatbotWindow.classList.remove('active');
                chatbotToggle.style.display = 'flex';
            } else {
                chatbotWindow.classList.add('active');
                chatbotToggle.style.display = 'none';
                this.focusChatInput();
            }
        }
    }

    minimizeChatbot() {
        const chatbotWindow = document.getElementById('chatbotWindow');
        const chatbotToggle = document.getElementById('chatbotToggle');
        
        if (chatbotWindow) {
            chatbotWindow.classList.remove('active');
            chatbotToggle.style.display = 'flex';
        }
    }

    focusChatInput() {
        const chatbotInput = document.getElementById('chatbotInput');
        if (chatbotInput) {
            setTimeout(() => chatbotInput.focus(), 300);
        }
    }

    sendMessage() {
        const chatbotInput = document.getElementById('chatbotInput');
        const message = chatbotInput?.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        chatbotInput.value = '';
        chatbotInput.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addMessage(response, 'bot');
        }, 1500);
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const avatar = document.createElement('span');
        avatar.className = `${sender}-avatar`;
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<p>${content}</p>`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save to chat history
        this.saveChatMessage(content, sender);
    }

    generateAIResponse(userMessage) {
        const context = this.getBusinessContext();
        const lowerMessage = userMessage.toLowerCase();
        
        // Content improvement suggestions
        if (lowerMessage.includes('improve') || lowerMessage.includes('mejorar') || lowerMessage.includes('better')) {
            return this.generateContentImprovement(context);
        }
        
        // Platform optimization
        if (lowerMessage.includes('instagram') || lowerMessage.includes('facebook') || lowerMessage.includes('optimize')) {
            return this.generatePlatformOptimization(context, userMessage);
        }
        
        // Creative ideas
        if (lowerMessage.includes('ideas') || lowerMessage.includes('creative') || lowerMessage.includes('suggestions')) {
            return this.generateCreativeIdeas(context);
        }
        
        // General help
        if (lowerMessage.includes('help') || lowerMessage.includes('ayuda') || lowerMessage.includes('how to')) {
            return this.generateHelpResponse();
        }
        
        // Context-aware response
        return this.generateContextualResponse(context, userMessage);
    }

    getBusinessContext() {
        if (this.currentBusinessContext) {
            return this.currentBusinessContext;
        }
        
        // Try to get current form data
        const businessType = document.getElementById('businessType')?.value;
        const socialMedia = document.getElementById('socialMedia')?.value;
        const language = document.getElementById('language')?.value;
        
        return {
            businessType,
            socialMedia,
            language,
            hasContent: !!this.currentGeneratedImage || !!this.calendarData
        };
    }

    generateContentImprovement(context) {
        const suggestions = [
            "✨ **Suggestion**: Add more emotional language to connect with your audience.",
            "📱 **Tip**: Include a clear call-to-action in your posts.",
            "🎯 **Advice**: Use hashtags relevant to your local area.",
            "⏰ **Timing**: Post during peak hours (6-8 PM) for better engagement.",
            "🖼️ **Visual**: Always include high-quality images or videos."
        ];
        
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    generatePlatformOptimization(context, message) {
        const platform = this.extractPlatform(message) || context.socialMedia;
        
        const platformTips = {
            instagram: "📷 **Instagram Tips**: Use 1:1 or 4:5 ratios, add engaging captions, use 5-10 relevant hashtags, and post Stories daily for better reach.",
            facebook: "📘 **Facebook Tips**: Keep posts under 80 characters, ask questions to encourage comments, and share user-generated content.",
            tiktok: "🎵 **TikTok Tips**: Use trending sounds, keep videos under 30 seconds, add text overlays, and participate in challenges.",
            twitter: "🐦 **X/Twitter Tips**: Keep tweets under 280 characters, use 2-3 hashtags, engage with replies quickly, and tweet 3-5 times daily."
        };
        
        return platformTips[platform] || platformTips.instagram;
    }

    generateCreativeIdeas(context) {
        const businessType = context.businessType;
        
        const ideas = {
            restaurant: [
                "🍽️ **Behind the Scenes**: Show your kitchen team preparing today's special.",
                "📸 **Customer Spotlight**: Feature happy customers with their permission.",
                "🎉 **Weekly Special**: Create a 'Dish of the Week' campaign."
            ],
            retail: [
                "🛍️ **Product Spotlight**: Highlight one product per day with its story.",
                "👥 **Staff Picks**: Have employees share their favorite items.",
                "🎁 **Gift Ideas**: Create gift guides for different occasions."
            ],
            beauty: [
                "💄 **Before/After**: Share transformation photos (with permission).",
                "📚 **Tutorial Tuesday**: Weekly makeup or skincare tutorials.",
                "✨ **Product Demo**: Show how to use products effectively."
            ]
        };
        
        const typeIdeas = ideas[businessType] || ideas.retail;
        return typeIdeas[Math.floor(Math.random() * typeIdeas.length)];
    }

    generateHelpResponse() {
        return `I can help you with:
        
🎨 **Content Creation**: Improve your marketing content
📱 **Platform Optimization**: Tailor content for different social media
💡 **Creative Ideas**: Get fresh content suggestions
📅 **Planning**: Organize your content calendar
🖼️ **Images**: Generate visual content

Try asking me about any of these topics, or describe what you'd like to achieve with your marketing!`;
    }

    generateContextualResponse(context, message) {
        if (!context.hasContent) {
            return "👋 Welcome! Start by generating some marketing content using the form above, and then I can help you improve and optimize it!";
        }
        
        return `Based on your current setup, I suggest focusing on creating engaging content for ${context.socialMedia || 'your social media platforms'}. Would you like specific tips for content improvement or creative ideas?`;
    }

    extractPlatform(message) {
        const platforms = ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'blog'];
        const lowerMessage = message.toLowerCase();
        
        return platforms.find(platform => lowerMessage.includes(platform));
    }

    handleQuickAction(action) {
        const actionMessages = {
            improve: "Can you help me improve my current marketing content?",
            optimize: "How can I optimize my content for better engagement?",
            ideas: "I need some creative ideas for my social media posts."
        };
        
        const message = actionMessages[action];
        if (message) {
            document.getElementById('chatbotInput').value = message;
            this.sendMessage();
        }
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    saveChatMessage(content, sender) {
        this.chatHistory.push({
            content,
            sender,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 messages
        if (this.chatHistory.length > 50) {
            this.chatHistory = this.chatHistory.slice(-50);
        }
        
        localStorage.setItem('localBoostChatHistory', JSON.stringify(this.chatHistory));
    }

    updateBusinessContext(content) {
        this.currentBusinessContext = content;
    }

    // Enhanced Social Media Functions
    getPlatformIcon(platform) {
        const icons = {
            instagram: '📷',
            facebook: '📘',
            tiktok: '🎵',
            twitter: '🐦',
            linkedin: '💼',
            blog: '📝'
        };
        return icons[platform] || '📱';
    }

    getPlatformName(platform) {
        const names = {
            instagram: 'Instagram',
            facebook: 'Facebook',
            tiktok: 'TikTok',
            twitter: 'X/Twitter',
            linkedin: 'LinkedIn',
            blog: 'Blog'
        };
        return names[platform] || platform;
    }

    formatSocialMediaContent(content) {
        // Split content by lines and format with proper styling
        const lines = content.split('\n').filter(line => line.trim());
        
        return lines.map(line => {
            // Add hashtags highlighting
            if (line.includes('#')) {
                return line.replace(/(#\w+)/g, '<span class="hashtag">$1</span>');
            }
            // Add mentions highlighting
            if (line.includes('@')) {
                return line.replace(/(@\w+)/g, '<span class="mention">$1</span>');
            }
            return line;
        }).join('<br>');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MarketingContentGenerator();
});
