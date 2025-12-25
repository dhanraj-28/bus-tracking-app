import React, { createContext, useState } from "react";

export const translations = {
  en: {
    menu: "MENU",
    changeLanguage: "Change Language",
    sos: "SOS",
    notification: "Notification",
    payments: "Payments",
    logout: "Logout",
    languageTitle: "Language",
    search: "Search",
    logoutConfirm: "Are you sure you want to log out?",
    logoutBtn: "Logout",
    loggedOut: "Logged Out",
    loggedOutMsg: "You have been successfully logged out.",
  },

  ta: {
    menu: "மெனு",
    changeLanguage: "மொழி மாற்று",
    sos: "உதவி",
    notification: "அறிவிப்புகள்",
    payments: "கட்டணங்கள்",
    logout: "வெளியேறு",
    languageTitle: "மொழி",
    search: "தேடல்",
    logoutConfirm: "நீங்கள் வெளியேற விரும்புகிறீர்களா?",
    logoutBtn: "வெளியேறு",
    loggedOut: "வெளியேறப்பட்டது",
    loggedOutMsg: "நீங்கள் வெற்றிகரமாக வெளியேறிவிட்டீர்கள்.",
  },

  te: {
    menu: "మెనూ",
    changeLanguage: "భాష మార్చు",
    sos: "సహాయం",
    notification: "నోటిఫికేషన్",
    payments: "చెల్లింపులు",
    logout: "లాగ్ అవుట్",
    languageTitle: "భాష",
    search: "వెతకండి",
    logoutConfirm: "మీరు లాగ్ అవుట్ కావాలనుకుంటున్నారా?",
    logoutBtn: "లాగ్ అవుట్",
    loggedOut: "లాగ్ అవుట్",
    loggedOutMsg: "మీరు విజయవంతంగా లాగ్ అవుట్ అయ్యారు.",
  },

  hi: {
    menu: "मेनू",
    changeLanguage: "भाषा बदलें",
    sos: "आपातकाल",
    notification: "सूचनाएं",
    payments: "भुगतान",
    logout: "लॉग आउट",
    languageTitle: "भाषा",
    search: "खोजें",
    logoutConfirm: "क्या आप लॉग आउट करना चाहते हैं?",
    logoutBtn: "लॉग आउट",
    loggedOut: "लॉग आउट",
    loggedOutMsg: "आप सफलतापूर्वक लॉग आउट हो गए हैं।",
  },

  kn: {
    menu: "ಮೆನು",
    changeLanguage: "ಭಾಷೆ ಬದಲಿಸಿ",
    sos: "ಸಹಾಯ",
    notification: "ಅಧಿಸೂಚನೆಗಳು",
    payments: "ಪಾವತಿಗಳು",
    logout: "ಲಾಗ್ ಔಟ್",
    languageTitle: "ಭಾಷೆ",
    search: "ಹುಡುಕು",
    logoutConfirm: "ನೀವು ಲಾಗ್ ಔಟ್ ಮಾಡಲು ಬಯಸುವಿರಾ?",
    logoutBtn: "ಲಾಗ್ ಔಟ್",
    loggedOut: "ಲಾಗ್ ಔಟ್",
    loggedOutMsg: "ನೀವು ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ ಔಟ್ ಆಗಿದ್ದೀರಿ.",
  },

  ml: {
    menu: "മെനു",
    changeLanguage: "ഭാഷ മാറ്റുക",
    sos: "സഹായം",
    notification: "അറിയിപ്പുകൾ",
    payments: "പേയ്മെന്റുകൾ",
    logout: "ലോഗൗട്ട്",
    languageTitle: "ഭാഷ",
    search: "തിരയുക",
    logoutConfirm: "നിങ്ങൾ ലോഗൗട്ട് ചെയ്യണോ?",
    logoutBtn: "ലോഗൗട്ട്",
    loggedOut: "ലോഗൗട്ട് ചെയ്തു",
    loggedOutMsg: "നിങ്ങൾ വിജയകരമായി ലോഗൗട്ട് ചെയ്തു.",
  },

  mr: {
    menu: "मेनू",
    changeLanguage: "भाषा बदला",
    sos: "मदत",
    notification: "सूचना",
    payments: "पेमेंट्स",
    logout: "लॉग आउट",
    languageTitle: "भाषा",
    search: "शोधा",
    logoutConfirm: "तुम्हाला लॉग आउट करायचे आहे का?",
    logoutBtn: "लॉग आउट",
    loggedOut: "लॉग आउट",
    loggedOutMsg: "तुम्ही यशस्वीरित्या लॉग आउट झाला आहात.",
  },

  bn: {
    menu: "মেনু",
    changeLanguage: "ভাষা পরিবর্তন করুন",
    sos: "জরুরি",
    notification: "বিজ্ঞপ্তি",
    payments: "পেমেন্ট",
    logout: "লগ আউট",
    languageTitle: "ভাষা",
    search: "অনুসন্ধান",
    logoutConfirm: "আপনি কি লগ আউট করতে চান?",
    logoutBtn: "লগ আউট",
    loggedOut: "লগ আউট",
    loggedOutMsg: "আপনি সফলভাবে লগ আউট হয়েছেন।",
  },

  ur: {
    menu: "مینو",
    changeLanguage: "زبان تبدیل کریں",
    sos: "ایمرجنسی",
    notification: "اطلاعات",
    payments: "ادائیگیاں",
    logout: "لاگ آؤٹ",
    languageTitle: "زبان",
    search: "تلاش کریں",
    logoutConfirm: "کیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟",
    logoutBtn: "لاگ آؤٹ",
    loggedOut: "لاگ آؤٹ",
    loggedOutMsg: "آپ کامیابی سے لاگ آؤٹ ہو گئے ہیں۔",
  },

  fr: {
    menu: "MENU",
    changeLanguage: "Changer de langue",
    sos: "Urgence",
    notification: "Notifications",
    payments: "Paiements",
    logout: "Déconnexion",
    languageTitle: "Langue",
    search: "Rechercher",
    logoutConfirm: "Voulez-vous vous déconnecter ?",
    logoutBtn: "Déconnexion",
    loggedOut: "Déconnecté",
    loggedOutMsg: "Vous vous êtes déconnecté avec succès.",
  },

  es: {
    menu: "MENÚ",
    changeLanguage: "Cambiar idioma",
    sos: "Emergencia",
    notification: "Notificaciones",
    payments: "Pagos",
    logout: "Cerrar sesión",
    languageTitle: "Idioma",
    search: "Buscar",
    logoutConfirm: "¿Desea cerrar sesión?",
    logoutBtn: "Cerrar sesión",
    loggedOut: "Sesión cerrada",
    loggedOutMsg: "Ha cerrado sesión correctamente.",
  },
};


export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
