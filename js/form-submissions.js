// js/form-submissions.js
(() => {
  const getConfig = () => (window.ECOGUARD_CONFIG && window.ECOGUARD_CONFIG.forms) || {};

  const showMessage = (form, type, text) => {
    const existing = form.querySelector('.ecg-submit-message');
    if (existing) existing.remove();

    const message = document.createElement('p');
    message.className =
      `ecg-submit-message mt-3 text-sm font-medium ${
        type === 'success' ? 'text-emerald-700' : 'text-red-600'
      }`;
    message.textContent = text;
    form.appendChild(message);
  };

  const setLoading = (form, loading) => {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent || 'Submit';
    button.disabled = loading;
    button.classList.toggle('opacity-70', loading);
    button.classList.toggle('cursor-not-allowed', loading);
    button.textContent = loading ? 'Sending...' : button.dataset.defaultText;
  };

  const serializeForm = (form) => {
    const formData = new FormData(form);
    const payload = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = String(value).trim();
    }
    payload.formType = form.dataset.submitForm || 'general';
    payload.page = window.location.pathname.split('/').pop() || 'index.html';
    payload.createdAt = new Date().toISOString();
    return payload;
  };

  const toFirestoreFields = (payload) => {
    const fields = {};
    Object.entries(payload).forEach(([key, value]) => {
      fields[key] = { stringValue: String(value) };
    });
    return { fields };
  };

  const submitToGoogleSheets = async (payload, config) => {
    if (!config.googleSheets || !config.googleSheets.endpoint) {
      throw new Error('Google Sheets endpoint is not configured.');
    }
    const response = await fetch(config.googleSheets.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to submit to Google Sheets.');
  };

  const submitToFirebase = async (payload, config) => {
    const fb = config.firebase || {};
    if (!fb.apiKey || !fb.projectId || !fb.collection) {
      throw new Error('Firebase configuration is incomplete.');
    }
    const url = `https://firestore.googleapis.com/v1/projects/${fb.projectId}/databases/(default)/documents/${fb.collection}?key=${fb.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreFields(payload)),
    });
    if (!response.ok) throw new Error('Failed to submit to Firebase.');
  };

  const submitToEmailJS = async (payload, config) => {
    const emailjs = config.emailjs || {};
    if (!emailjs.serviceId || !emailjs.templateId || !emailjs.publicKey) {
      throw new Error('EmailJS configuration is incomplete.');
    }
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailjs.serviceId,
        template_id: emailjs.templateId,
        user_id: emailjs.publicKey,
        template_params: {
          ...payload,
          to_email: emailjs.toEmail || 'info@ecoguardinitiativeuganda.org',
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to send through EmailJS.');
  };

  const submitPayload = async (payload) => {
    const config = getConfig();
    const provider = config.provider || 'google-sheets';

    if (provider === 'google-sheets') return submitToGoogleSheets(payload, config);
    if (provider === 'firebase') return submitToFirebase(payload, config);
    if (provider === 'emailjs') return submitToEmailJS(payload, config);

    throw new Error('Unknown form provider configured.');
  };

  const bindForm = (form) => {
    if (form.dataset.backendBound === 'true') return;
    form.dataset.backendBound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setLoading(form, true);

      try {
        const payload = serializeForm(form);
        await submitPayload(payload);
        showMessage(form, 'success', 'Thank you. Your submission was sent successfully.');
        form.reset();
      } catch (error) {
        showMessage(form, 'error', error.message || 'Submission failed. Please try again.');
      } finally {
        setLoading(form, false);
      }
    });
  };

  const init = () => {
    document.querySelectorAll('form[data-submit-form]').forEach(bindForm);
  };

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('components:loaded', init);
})();
