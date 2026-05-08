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

// function mostraScheda(index) {
//     const p = personaggi[index];
//     const sheet = document.getElementById('character-sheet');
//     const list = document.getElementById('character-list'); // Selettore lista
    
//     // 1. Nascondi la lista personaggi
//     list.classList.add('nascosto');
    
//     // Inizializzazione valori attuali (se non presenti)
//     if(!p.forza_attuale) p.forza_attuale = parseInt(p.Forza);
//     if(!p.agilita_attuale) p.agilita_attuale = parseInt(p.Agilità);
//     if(!p.acume_attuale) p.acume_attuale = parseInt(p.Acume);
//     if(!p.empatia_attuale) p.empatia_attuale = parseInt(p.Empatia);

//     let html = `
//         <div class="character-header">
//             <!-- Pulsante per tornare alla lista -->
//             <button onclick="chiudiScheda()" class="btn-back">⬅ Torna alla lista</button>
//             <h2>${p.Nome}</h2>
//             <p><em>"${p.Soprannome}"</em> - ${p.Stirpe} ${p.Professione}</p>
//         </div>

//         <div class="stats-grid">
//             <h3>Attributi (Danni/Malus)</h3>
//             ${generatoreWidgetAttributo(index, 'Forza', p.forza_attuale)}
//             ${generatoreWidgetAttributo(index, 'Agilità', p.agilita_attuale)}
//             ${generatoreWidgetAttributo(index, 'Acume', p.acume_attuale)}
//             ${generatoreWidgetAttributo(index, 'Empatia', p.empatia_attuale)}
//         </div>

//         <div class="skills-section">
//             <h3>Abilità</h3>
//     `;

//     Object.keys(abilitàSuAttributo).forEach(nomeAbil => {
//         if(p[nomeAbil] !== undefined && p[nomeAbil] !== "") {
//             html += generaRigaAbilità(p, nomeAbil, index);
//         }
//     });

//     html += `</div>`;

//     sheet.innerHTML = html;
//     sheet.classList.remove('nascosto');
//     sheet.classList.add('visibile');
// }

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
    const valAttrAttuale = p[`${nomeAttr.toLowerCase()}_attuale`];
    // Prendiamo il valore base dell'abilità dal database
    const valAbilità = valoreForzato; // Usa il valore che abbiamo passato
    return `
        <div class="skill-row">
            <span class="skill-name">${nomeAbilità}</span>
            <div class="skill-right">
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