document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('pre.src, pre.example');
    const inputs = document.querySelectorAll('.dynamic-input');

    // 1️⃣ freeze the pristine template once
    blocks.forEach(b => b.dataset.originalText = b.textContent);

    function updatePlaceholders() {
        // 2️⃣ restore pristine state every keystroke
        blocks.forEach(b => b.textContent = b.dataset.originalText);

        inputs.forEach(inp => {
            const placeholder = inp.dataset.placeholder;
            const value = inp.value.trim();
            if (!placeholder || !value) return;

            // 3️⃣ escape RegExp special chars in user input
            const esc = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(placeholder, 'g');

            blocks.forEach(b => b.textContent = b.textContent.replace(re, value));
        });
    }

    inputs.forEach(i => i.addEventListener('input', updatePlaceholders));
});
