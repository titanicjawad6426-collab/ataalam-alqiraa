function speak(text, language) {
    if (!("speechSynthesis" in window)) {
        alert("الصوت غير مدعوم في هذا المتصفح.");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

function showMessage(message) {
    alert(message);
}

function openSection(sectionName) {
    const element = document.getElementById(sectionName);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth"
        });
    }
}
