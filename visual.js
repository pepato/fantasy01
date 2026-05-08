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

/* --- FUNZIONI PER VISUALIZZAZIONE BLOCCHI --- */
function mostraElenco() {
    const listContainer = document.getElementById('character-list');
    listContainer.innerHTML = ''; // Pulisce

    personaggi.forEach((p, index) => {
        // Creiamo il div per ogni personaggio
        const card = document.createElement('div');
        card.className = 'char-card-mini';
        card.innerHTML = `
            <strong>${p.Nome}</strong> - ${p.Soprannome}<br>
            <small>${p.Stirpe} | ${p.Professione}</small>
        `;
        
        // AGGANCIAMO L'HANDLER (Il click per aprire la scheda)
        card.onclick = () => mostraScheda(index);
        
        listContainer.appendChild(card);
    });
}


function chiudiScheda() {
    const sheet = document.getElementById('character-sheet');
    const list = document.getElementById('character-list');

    // Nasconde la scheda
    sheet.classList.remove('visibile');
    sheet.classList.add('nascosto');
    sheet.innerHTML = ''; // Svuota il contenuto per pulizia

    // Mostra la lista
    list.classList.remove('nascosto');
    list.classList.add('visibile');
}

function generaRigaAbilità(p, nomeAbilità, indexPersonaggio, valoreForzato) {
    const nomeAttr = abilitàSuAttributo[nomeAbilità]; 
    // Prendiamo il valore attuale (quello con i malus)
    const campoAttr = `${nomeAttr.toLowerCase().replace("à", "a")}_attuale`; // strippiamo gli accenti
    const valAttrAttuale = p[campoAttr];
    // Prendiamo il valore base dell'abilità dal database
    const valAbilità = valoreForzato; // Usa il valore che abbiamo passato
    return `
        <div class="skill-row">
            <span class="skill-name">${nomeAbilità}</span>
            <div class="skill-value">
                <span class="skill-value">${valAbilità}</span>
                <button class="btn-roll-skill" onclick="lanciaPool('${nomeAbilità}', '${nomeAttr}', ${valAttrAttuale}, ${valAbilità})">
                    🎲
                </button>
            </div>
        </div>
    `;
}

/* --- FUNZIONI VISUALIZZAZIONE BLOCCHI --- */
function toggleView(showSheet) {
    const list = document.getElementById('character-list');
    const sheet = document.getElementById('character-sheet');

    if (showSheet) {
        list.classList.add('is-hidden');
        // Delay minimo per permettere il rendering dell'HTML
        setTimeout(() => {
            sheet.classList.add('is-active');
        }, 50);
    } else {
        sheet.classList.remove('is-active');
        setTimeout(() => {
            list.classList.remove('is-hidden');
            window.scrollTo(0, 0);
        }, 800); // 800ms corrisponde a --roll-speed nel CSS
    }
}

function mostraScheda(index) {
    costruisciSchedaHTML(index); // Chiama la logica in script.js
    toggleView(true);
}

function chiudiScheda() {
    toggleView(false);
}