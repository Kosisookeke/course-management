# Student Reflection Page with i18n/l10n Support

## Overview

This is a multilingual student reflection page that demonstrates internationalization (i18n) and localization (l10n) concepts. Students can reflect on their course experience in multiple languages with a responsive, accessible interface.

## Features

### 🌍 Internationalization (i18n)

- **Multi-language support**: English, French (Français), and Spanish (Español)
- **Dynamic language switching** with smooth transitions
- **JSON-based translation system** for easy maintenance
- **Automatic language preference saving** using localStorage

### 📝 Reflection Form

- **Three reflection questions** covering course experience
- **Star rating system** for overall course evaluation
- **Auto-save functionality** to prevent data loss
- **Form validation** with user-friendly messages

### 🎨 User Experience

- **Responsive design** that works on all devices
- **Smooth animations** and transitions
- **Accessibility features** including keyboard navigation
- **Modern gradient design** with professional styling

### 💾 Data Management

- **Local storage** for user preferences and draft answers
- **Submission tracking** with timestamp and language info
- **Data export functionality** for analysis
- **Offline support** preparation (service worker ready)

## Technical Implementation

### File Structure

```
student-reflection/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── script.js           # JavaScript functionality
├── translations.js     # i18n translation data
└── README.md          # This documentation
```

### Key Technologies

- **HTML5**: Semantic structure with accessibility attributes
- **CSS3**: Grid, Flexbox, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, classes, and modern APIs
- **localStorage**: Client-side data persistence
- **JSON**: Translation data structure

### Translation System

The translation system uses a nested object structure:

```javascript
translations = {
  en: { key: "English text" },
  fr: { key: "Texte français" },
  es: { key: "Texto español" },
};
```

## Usage Instructions

### For Students

1. **Open the page** in any modern web browser
2. **Select your preferred language** from the dropdown
3. **Fill out the reflection questions** (auto-saved as you type)
4. **Rate the course** using the star system
5. **Submit your reflection** when complete

### For Developers

1. **Clone or download** the files to your local machine
2. **Open index.html** in a web browser to test locally
3. **Modify translations.js** to add new languages or update text
4. **Customize styles.css** for different themes or branding
5. **Deploy to Netlify hosting service**

## Netflify Pages Deployment
Webpage is available at: `https://studentsref.netlify.app/`

## Support

For questions or issues with this reflection page, please refer to the course management platform documentation or contact the development team.

---

**Created as part of Module 3: Student Reflection Page with i18n/l10n Support**  
_Demonstrating practical internationalization and localization concepts_
