// VARIABILI ------------------------------------
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU3ngjAe_2drauShjCqUlVuETjbciigqF40uHF55cx5ja3bNHtzxMm1p2VaCo3-QiSs0R75hHcKcKX/pub?gid=0&single=true&output=csv";
const abilitàSuAttributo = {
    "Artigianato (Fo)": "Forza",
    "Mischia (Fo)": "Forza",
    "Resistenza (Fo)": "Forza",
    "Vigore (Fo)": "Forza",
    "Furtività (Ag)": "Agilità",
    "Mira (Ag)": "Agilità",
    "Movimento (Ag)": "Agilità",
    "Rapidità di mano (Ag)": "Agilità",
    "Erudizione (Ac)": "Acume",
    "Intuito (Ac)": "Acume",
    "Percezione (Ac)": "Acume",
    "Sopravvivenza (Ac)": "Acume",
    "Addestrare Animali (Em)": "Empatia",
    "Esibizione (Em)": "Empatia",
    "Guarire (Em)": "Empatia",
    "Persuasione (Em)": "Empatia"
};

let personaggi = [];
let ultimoLancio = null; // per gestire log dei lanci

// FUNZIONI ------------------------------------
function init() {
    Papa.parse(sheetURL, {
        download: true,
        header: true,
        complete: function(results) {
            personaggi = results.data;
            mostraElenco();
        }
    });
}

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

function mostraScheda(index) {
    const p = personaggi[index];
    const sheet = document.getElementById('character-sheet');
    
    // Inizializziamo i valori "attuali" solo la prima volta che apriamo la scheda
    if(!p.forza_attuale) p.forza_attuale = parseInt(p.Forza);
    if(!p.agilita_attuale) p.agilita_attuale = parseInt(p.Agilità);
    if(!p.acume_attuale) p.acume_attuale = parseInt(p.Acume);
    if(!p.empatia_attuale) p.empatia_attuale = parseInt(p.Empatia);

    // COSTRUZIONE HTML
    let html = `
        <div class="character-header">
            <h2>${p.Nome}</h2>
            <p><em>"${p.Soprannome}"</em> - ${p.Stirpe} ${p.Professione}</p>
        </div>

        <div class="stats-grid">
            <h3>Attributi (Danni/Malus)</h3>
            ${generatoreWidgetAttributo(index, 'Forza', p.forza_attuale)}
            ${generatoreWidgetAttributo(index, 'Agilità', p.agilita_attuale)}
            ${generatoreWidgetAttributo(index, 'Acume', p.acume_attuale)}
            ${generatoreWidgetAttributo(index, 'Empatia', p.empatia_attuale)}
        </div>

        <div class="skills-section">
            <h3>Abilità</h3>
    `;

    // Generiamo le righe delle abilità prendendole dalla mappa
    Object.keys(abilitàSuAttributo).forEach(nomeAbil => {
        // Se nel DB quel personaggio ha un valore per quella abilità, crea la riga
        if(p[nomeAbil] !== undefined) {
            html += generaRigaAbilità(p, nomeAbil);
        }
    });

    html += `</div>`; // Chiudiamo la sezione skills

    // Stampiamo tutto nel DOM e rendiamo visibile
    sheet.innerHTML = html;
    sheet.classList.remove('nascosto');
    sheet.classList.add('visibile');
}

/* --- 4. HELPER PER I BOTTONI + e - DEGLI ATTRIBUTI --- */
function generatoreWidgetAttributo(idx, nome, attuale) {
    const nomeStatDinamica = `${nome.toLowerCase()}_attuale`;
    return `
        <div class="stat-control">
            <strong>${nome}: </strong>
            <button onclick="modificaStat(${idx}, '${nomeStatDinamica}', -1)">-</button>
            <span class="stat-number">${attuale}</span>
            <button onclick="modificaStat(${idx}, '${nomeStatDinamica}', 1)">+</button>
        </div>
    `;
}


// Funzione per aumentare/diminuire il valore attuale
function modificaStat(index, statName, variazione) {
    const p = personaggi[index];
    const limiteBase = parseInt(p[statName.split('_')[0].charAt(0).toUpperCase() + statName.split('_')[0].slice(1)]); // Trova il valore base dal DB
    
    let nuovoValore = p[statName] + variazione;
    
    // Impediamo di superare il base o andare sotto lo zero
    if (nuovoValore >= 0 && nuovoValore <= limiteBase) {
        p[statName] = nuovoValore;
        mostraScheda(index); // Rinfresca la vista
    }
}


/* --- LE FUNZIONI DI SUPPORTO PER IL LANCIO --- */

function lanciaPool(etichetta, nomeAttr, numBase, numAbilità) {
    // 1. Recuperiamo i dadi extra dal campo input
    const inputExtra = document.getElementById('extra-dice');
    const numExtra = inputExtra ? parseInt(inputExtra.value) : 0;

    // 2. Creiamo l'oggetto globale "ultimoLancio"
    // Questo oggetto serve a "spingiTiro" per sapere cosa ritirare
    ultimoLancio = {
        label: etichetta,
        attributo: nomeAttr,
        dati: {
            base: generaDadi(numBase),     // Dadi bianchi (Attributo)
            abilita: generaDadi(numAbilità), // Dadi neri (Abilità)
            extra: generaDadi(numExtra)     // Dadi verdi (Oggetti/Aiuto)
        }
    };

    // 3. Chiamiamo la funzione che disegna i dadi a schermo
    renderLancio();

    // 4. Opzionale: resettiamo il campo dadi extra a zero dopo il lancio
    if (inputExtra) inputExtra.value = 0;
}

function generaDadi(numero) {
    let dadi = [];
    for (let i = 0; i < numero; i++) {
        // Genera un numero tra 1 e 6
        dadi.push(Math.floor(Math.random() * 6) + 1);
    }
    return dadi;
}

function renderLancio() {
    const log = document.getElementById('dice-log');
    if (!log) return; // Sicurezza se il log non esiste
    
    const l = ultimoLancio;
    
    // Calcoliamo i successi totali (tutti i 6)
    const successi = [...l.dati.base, ...l.dati.abilita, ...l.dati.extra].filter(d => d === 6).length;
    
    const div = document.createElement('div');
    div.className = 'lancio-container';
    
    // Costruiamo l'HTML del risultato
    div.innerHTML = `
        <div class="lancio-header">
            <strong>${l.label}</strong>: ${successi > 0 ? '✔️ ' + successi + ' Successi' : '❌ Fallimento'}
        </div>
        <div class="pool-visual">
            <div class="dice-group base">${visualizzaDadi(l.dati.base)}</div>
            <div class="dice-group abilita">${visualizzaDadi(l.dati.abilita)}</div>
            <div class="dice-group extra">${visualizzaDadi(l.dati.extra)}</div>
        </div>
        <button class="btn-push" onclick="spingiTiro()">Spingi il Tiro! ⚡</button>
        <hr>
    `;
    
    // Inseriamo in cima al log
    log.prepend(div);
}

function spingiTiro() {
    if (!ultimoLancio) return;

    // Logica semplificata: tira di nuovo i dadi che non sono 1 o 6
    ultimoLancio.dati.base = ultimoLancio.dati.base.map(d => (d === 1 || d === 6) ? d : Math.floor(Math.random() * 6) + 1);
    ultimoLancio.dati.abilita = ultimoLancio.dati.abilita.map(d => (d === 6) ? d : Math.floor(Math.random() * 6) + 1);
    ultimoLancio.dati.extra = ultimoLancio.dati.extra.map(d => (d === 6) ? d : Math.floor(Math.random() * 6) + 1);

    renderLancio(); // Aggiorna il log con il nuovo risultato
}

function clearLog() {
    const log = document.getElementById('dice-log');
    if (log) {
        log.innerHTML = '<p class="placeholder">Seleziona un\'abilità per lanciare i dadi</p>';
    }
}

function visualizzaDadi(array) {
    // Trasforma i numeri in quadratini colorati
    return array.map(d => `<span class="die val-${d}">${d}</span>`).join('');
}

function generaRigaAbilità(p, nomeAbilità, indexPersonaggio) {
    const nomeAttr = abilitàSuAttributo[nomeAbilità]; 
    // Prendiamo il valore attuale (quello con i malus)
    const valAttrAttuale = p[`${nomeAttr.toLowerCase()}_attuale`];
    // Prendiamo il valore base dell'abilità dal database
    const valAbilitàBase = parseInt(p[nomeAbilità]) || 0;

    return `
        <div class="skill-row">
            <span class="skill-name">${nomeAbilità}</span>
            <span class="skill-value">${valAbilitàBase}</span>
            <button class="btn-roll-skill" onclick="lanciaPool('${nomeAbilità}', '${nomeAttr}', ${valAttrAttuale}, ${valAbilitàBase})">
                🎲
            </button>
        </div>
    `;
}

window.onload = init;