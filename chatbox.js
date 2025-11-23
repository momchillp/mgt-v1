// Initialize EmailJS
emailjs.init("NbSB7ErxhgVwuvkxk"); // Your public key

// Helper to get current language
let currentLang = localStorage.getItem("selectedLang") || "en";

// Helper function for translation lookup
function t(key, fallback) {
  return translations?.[currentLang]?.[key] || fallback;
}

// Function to apply translations to the chatbox UI
function applyChatTranslations() {
  document.getElementById("chatbox-title").textContent = t("Chat_Title", "Contact Me");
  document.getElementById("chat-name").placeholder = t("Chat_Name", "Your Name");
  document.getElementById("chat-email").placeholder = t("Chat_Email", "Your Email");
  document.getElementById("chat-message").placeholder = t("Chat_Message", "Type your message...");
  document.getElementById("send-message").textContent = t("Chat_Send", "Send");
}

// Handle chatbox open/close
document.getElementById("chatbox-button").onclick = () => {
  document.getElementById("chatbox").style.display = "block";
  applyChatTranslations();
};

document.getElementById("close-chat").onclick = () => {
  document.getElementById("chatbox").style.display = "none";
};

// Handle sending message
document.getElementById("send-message").onclick = () => {
  const name = document.getElementById("chat-name").value.trim();
  const email = document.getElementById("chat-email").value.trim();
  const message = document.getElementById("chat-message").value.trim();

  if (!name || !email || !message) {
    return alert(t("Chat_FillFields", "Please fill in all fields!"));
  }

  emailjs
    .send("service_jxp4wim", "template_59tis3r", {
      name: name,
      email: email,
      message: message
    })
    .then(() => {
      alert(t("Chat_Success", "Message sent successfully!"));
      document.getElementById("chat-name").value = "";
      document.getElementById("chat-email").value = "";
      document.getElementById("chat-message").value = "";
    })
    .catch((err) => {
      console.error("FAILED...", err);
      alert(t("Chat_Fail", "Failed to send message."));
    });
};

// Update chatbox text if language changes dynamically
document.addEventListener("languageChanged", (e) => {
  currentLang = e.detail;
  applyChatTranslations();
});

// Apply initial translations on load
document.addEventListener("DOMContentLoaded", applyChatTranslations);
