class ReflectionApp {
    constructor() {
        this.currentLanguage = 'en';
        this.currentRating = 0;
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.setupEventListeners();
        this.updateLanguage(this.currentLanguage);
        this.setupStarRating();
    }

    loadUserPreferences() {
        const savedLanguage = localStorage.getItem('reflectionLanguage');
        const savedRating = localStorage.getItem('reflectionRating');
        const savedAnswers = JSON.parse(localStorage.getItem('reflectionAnswers') || '{}');

        if (savedLanguage && translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            document.getElementById('languageSelect').value = savedLanguage;
        }

        if (savedRating) {
            this.currentRating = parseInt(savedRating);
        }

        Object.keys(savedAnswers).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = savedAnswers[key];
            }
        });
    }

    saveUserPreferences() {
        localStorage.setItem('reflectionLanguage', this.currentLanguage);
        localStorage.setItem('reflectionRating', this.currentRating.toString());
        
        const answers = {
            answer1: document.getElementById('answer1').value,
            answer2: document.getElementById('answer2').value,
            answer3: document.getElementById('answer3').value
        };
        localStorage.setItem('reflectionAnswers', JSON.stringify(answers));
    }

    setupEventListeners() {
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.updateLanguage(e.target.value);
        });

        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitReflection();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearForm();
        });

        ['answer1', 'answer2', 'answer3'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.saveUserPreferences();
            });
        });

        document.getElementById('languageSelect').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });
    }

    updateLanguage(language) {
        if (!translations[language]) {
            console.error(`Language ${language} not found`);
            return;
        }

        document.body.classList.add('fade-out');
        
        setTimeout(() => {
            this.currentLanguage = language;
            document.documentElement.lang = language;
            
            document.title = this.translate('page.title');
            
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.translate(key);
                
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                element.placeholder = this.translate(key);
            });


            this.updateRatingText();
            
            this.saveUserPreferences();
            
            document.body.classList.remove('fade-out');
            document.body.classList.add('fade-in');
            
            setTimeout(() => {
                document.body.classList.remove('fade-in');
            }, 200);
        }, 100);
    }

    translate(key) {
        return translations[this.currentLanguage][key] || translations['en'][key] || key;
    }

    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1, 'hover');
            });
            
            star.addEventListener('mouseleave', () => {
                this.highlightStars(this.currentRating, 'active');
            });
            
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });

            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setRating(index + 1);
                }
            });

            star.setAttribute('tabindex', '0');
            star.setAttribute('role', 'button');
            star.setAttribute('aria-label', `Rate ${index + 1} star${index > 0 ? 's' : ''}`);
        });

        this.highlightStars(this.currentRating, 'active');
        this.updateRatingText();
    }

    highlightStars(count, className) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('active', 'hover');
            if (index < count) {
                star.classList.add(className);
            }
        });
    }

    setRating(rating) {
        this.currentRating = rating;
        this.highlightStars(rating, 'active');
        this.updateRatingText();
        this.saveUserPreferences();
        
        const stars = document.querySelectorAll('.star');
        stars[rating - 1].style.transform = 'scale(1.3)';
        setTimeout(() => {
            stars[rating - 1].style.transform = 'scale(1)';
        }, 200);
    }

    updateRatingText() {
        const ratingText = document.getElementById('ratingText');
        const ratingKeys = ['', 'rating.poor', 'rating.fair', 'rating.good', 'rating.verygood', 'rating.excellent'];
        
        if (this.currentRating === 0) {
            ratingText.textContent = this.translate('rating.default');
        } else {
            ratingText.textContent = this.translate(ratingKeys[this.currentRating]);
        }
    }

    submitReflection() {
        const answer1 = document.getElementById('answer1').value.trim();
        const answer2 = document.getElementById('answer2').value.trim();
        const answer3 = document.getElementById('answer3').value.trim();

        if (!answer1 && !answer2 && !answer3) {
            alert(this.translate('messages.fillRequired'));
            return;
        }

        const reflectionData = {
            timestamp: new Date().toISOString(),
            language: this.currentLanguage,
            rating: this.currentRating,
            answers: {
                question1: answer1,
                question2: answer2,
                question3: answer3
            }
        };

        const submissions = JSON.parse(localStorage.getItem('reflectionSubmissions') || '[]');
        submissions.push(reflectionData);
        localStorage.setItem('reflectionSubmissions', JSON.stringify(submissions));

        alert(this.translate('messages.submitted'));
        
        
        console.log('Reflection submitted:', reflectionData);
    }

    clearForm() {
        if (confirm(this.translate('messages.cleared'))) {
            document.getElementById('answer1').value = '';
            document.getElementById('answer2').value = '';
            document.getElementById('answer3').value = '';
            this.setRating(0);
            
            localStorage.removeItem('reflectionAnswers');
            localStorage.removeItem('reflectionRating');
            
            document.getElementById('answer1').focus();
        }
    }

    getAllSubmissions() {
        return JSON.parse(localStorage.getItem('reflectionSubmissions') || '[]');
    }

    exportData() {
        const data = {
            language: this.currentLanguage,
            currentAnswers: {
                answer1: document.getElementById('answer1').value,
                answer2: document.getElementById('answer2').value,
                answer3: document.getElementById('answer3').value
            },
            rating: this.currentRating,
            submissions: this.getAllSubmissions()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reflection-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.reflectionApp = new ReflectionApp();
    
    window.exportReflectionData = () => window.reflectionApp.exportData();
    
    console.log('🎓 Student Reflection Page with i18n/l10n Support');
    console.log('Available languages:', Object.keys(translations));
    console.log('To export data, run: exportReflectionData()');
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}