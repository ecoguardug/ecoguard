// js/site-config.js
// Update this file with your real backend credentials.
window.ECOGUARD_CONFIG = {
  forms: {
    provider: 'google-sheets', // 'google-sheets' | 'firebase' | 'emailjs'

    googleSheets: {
      endpoint: '', // Example: https://script.google.com/macros/s/XXXX/exec
    },

    firebase: {
      apiKey: '',
      projectId: '',
      collection: 'formSubmissions',
    },

    emailjs: {
      serviceId: '',
      templateId: '',
      publicKey: '',
      toEmail: 'info@ecoguardinitiativeuganda.org',
    },
  },
};
