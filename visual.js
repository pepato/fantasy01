// Esempio di funzione "strutturale" che potresti mettere in un file separato
function toggleView(showSheet) {
    const list = document.getElementById('character-list');
    const sheet = document.getElementById('character-sheet');

    if (showSheet) {
        list.classList.add('is-hidden');
        sheet.classList.add('is-active');
    } else {
        sheet.classList.remove('is-active');
        // Aspettiamo che la scheda finisca di arrotolarsi prima di mostrare la lista
        setTimeout(() => {
            list.classList.remove('is-hidden');
        }, 600); // 600ms è la durata che abbiamo scelto nel CSS
    }
}