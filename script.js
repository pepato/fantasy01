// VARIABILI ------------------------------------
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU3ngjAe_2drauShjCqUlVuETjbciigqF40uHF55cx5ja3bNHtzxMm1p2VaCo3-QiSs0R75hHcKcKX/pub?gid=0&single=true&output=csv";
//const sheetURL = "personaggi.csv";
const abilitàSuAttributo = {
    "Artigianato (Fo)": "Forza",
    "Mischia (Fo)": "Forza",
    "Resistenza (Fo)": "Forza",
    "Vigore (Fo)": "Forza",
    "Furtività (Ag)": "Agilita",
    "Mira (Ag)": "Agilita",
    "Movimento (Ag)": "Agilita",
    "Rapidità di mano (Ag)": "Agilita",
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



/* --- FUNZIONE DI ASSEMBLAGGIO --- */

function costruisciSchedaHTML(index) {
    const p = personaggi[index];
    const sheet = document.getElementById('character-sheet');
    
    // Inizializzazione valori attuali
   
    if (p.forza_attuale === undefined) p.forza_attuale = parseInt(p["Forza"] || 0);
    if (p.agilita_attuale === undefined) p.agilita_attuale = parseInt(p["Agilita"] || 0);
    if (p.acume_attuale === undefined) p.acume_attuale = parseInt(p["Acume"] || 0);
    if (p.empatia_attuale === undefined) p.empatia_attuale = parseInt(p["Empatia"] || 0);
    // Inizializzazione nuovi valori se non esistono
    p.volonta_attuale = p.volonta_attuale || parseInt(p.Volontà || 0);
    p.esperienza_attuale = p.esperienza_attuale || parseInt(p.Esperienza || 0);
    p.reputazione_attuale = p.reputazione_attuale || parseInt(p.Reputazione || 0);

    // Header (sempre in alto)
    let html = creaHeaderScheda(p, index); 

    // Apertura contenitore Layout a due colonne
    html += `<div class="sheet-grid-container">`;

    // --- COLONNA SINISTRA (Valori, Attributi, Abilità) ---
    html += `<div class="sheet-left-side">`;
        html += `
            <div class="counters-row">
                ${generatoreWidgetSemplice(index, 'Volontà', p.volonta_attuale, 'volonta_attuale')}
                ${generatoreWidgetSemplice(index, 'Reputazione', p.reputazione_attuale, 'reputazione_attuale')}
                ${generatoreWidgetSemplice(index, 'Esperienza', p.esperienza_attuale, 'esperienza_attuale')}
            </div>`;
        html += creaSezioneAttributi(p, index);
        html += `<div class="skills-section"><h3>Abilità</h3>`;
            // Cicliamo su TUTTE le abilità definite nel dizionario iniziale
            Object.keys(abilitàSuAttributo).forEach(nomeAbil => {
                // Se il valore nel foglio è vuoto o mancante, usiamo 0
                const valoreAbil = p[nomeAbil] ? parseInt(p[nomeAbil]) : 0;
                html += generaRigaAbilità(p, nomeAbil, index, valoreAbil);
            });
        html += `</div>`;
    html += `</div>`; // fine sinistra

    // --- COLONNA DESTRA (Ritratto, Orgoglio, Segreto, Background) ---
    html += `<div class="sheet-right-side">`;
        html += `
            <div class="char-details-vertical">
                <img src="${p.Ritratto}" class="char-portrait-large" alt="Ritratto">
                <div class="detail-box"><strong>Orgoglio:</strong><p>${p.Orgoglio || '...'}</p></div>
                <div class="detail-box"><strong>Segreto Oscuro:</strong><p>${p["Segreto Oscuro"] || '...'}</p></div>
                <div class="detail-box"><strong>Background:</strong><p>${p.Background || '...'}</p></div>
            </div>`;
    html += `</div>`; // fine destra

    html += `</div>`; // fine grid-container

    sheet.innerHTML = html;
}

/* --- HELPER PER I BOTTONI + e - DEGLI ATTRIBUTI --- */
// Accettiamo 'label' (per lo schermo) e 'techName' (per il codice)
function generatoreWidgetAttributo(idx, label, techName, valore) {
    const campoDinamico = `${techName.toLowerCase()}_attuale`;  
    
    return `
        <div class="attribute-item">
            <label>${label}</label>
            <div class="control-group">
                <button onclick="modificaStat(${idx}, '${campoDinamico}', -1)">-</button>
                <span>${valore}</span>
                <button onclick="modificaStat(${idx}, '${campoDinamico}', 1)">+</button>
            </div>
        </div>
    `;
}


// Funzione per aumentare/diminuire il valore attuale
function modificaStat(index, statName, variazione) {
    const p = personaggi[index];
    const limiteBase = parseInt(p[statName.split('_')[0].charAt(0).toUpperCase() + statName.split('_')[0].slice(1)]); // Trova il valore base dal DB
    
    let nuovoValore = parseInt(p[statName]) + variazione;
    
    // Impediamo di superare il base o andare sotto lo zero
    if (nuovoValore >= 0 && nuovoValore <= limiteBase) {
        p[statName] = nuovoValore;
        mostraScheda(index); // Rinfresca la vista
    }
}

/* --- COMPONENTI UI (I "Mattoncini") --- */

function creaHeaderScheda(p, index) {
    return `
        <div class="character-header">
            <button onclick="chiudiScheda()" class="btn-back">⬅ Torna alla lista</button>
            <h2>${p.Nome}</h2>
            <p class="soprannome">${p.Soprannome}</p>
            <h3>${p.Stirpe} - ${p.Professione}</h3>
        
        </div>`;
}

function creaSezioneAttributi(p, index) {
    return `
        <div class="stats-grid">
            <h3>Attributi (Danni/Malus)</h3>
            ${generatoreWidgetAttributo(index, 'Forza', 'Forza', p.forza_attuale)}
            ${generatoreWidgetAttributo(index, 'Agilità', 'Agilita', p.agilita_attuale)} 
            ${generatoreWidgetAttributo(index, 'Acume', 'Acume', p.acume_attuale)}
            ${generatoreWidgetAttributo(index, 'Empatia', 'Empatia', p.empatia_attuale)}
        </div>`;
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
    if (!log) return;
    
    // Rimuovi il placeholder se presente
    const placeholder = log.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const l = ultimoLancio;
    
    // Calcolo successi (tutti i 6)
    const successi = [...l.dati.base, ...l.dati.abilita, ...l.dati.extra].filter(d => d === 6).length;
    // Calcolo traumi (solo gli 1 sui dadi BASE)
    const traumi = l.dati.base.filter(d => d === 1).length;

    const div = document.createElement('div');
    div.className = 'lancio-container log-entry'; // Usa log-entry che ha già il bordo rosso    
   
    // Usiamo una tabella o dei flexbox per rendere i risultati più ordinati
    div.innerHTML = `
        <div class="lancio-header">
            <strong>${l.label.toUpperCase()}</strong>
            <div class="res-summary">
                <span class="res-succ">✨ ${successi}</span> | 
                <span class="res-traum">💀 ${traumi}</span>
            </div>
        </div>
        <div class="pool-visual">
            <div class="dice-group"><div class="dice-list base">${visualizzaDadi(l.dati.base)}</div></div>
            <div class="dice-group"><div class="dice-list abilita">${visualizzaDadi(l.dati.abilita)}</div></div>
            <div class="dice-group"><div class="dice-list extra">${visualizzaDadi(l.dati.extra)}</div></div>
        </div>
        <button class="btn-push" onclick="spingiTiro()">SPINGI IL TIRO! ⚡</button>
    `;
    
    log.prepend(div);
}

function spingiTiro() {
    if (!ultimoLancio) return;

    // Logica Forbidden Lands:
    // 1. Dadi Base: tieni 1 e 6, rilancia il resto
    ultimoLancio.dati.base = ultimoLancio.dati.base.map(d => (d === 1 || d === 6) ? d : Math.floor(Math.random() * 6) + 1);
    
    // 2. Dadi Abilità: tieni solo i 6, rilancia il resto (anche gli 1!)
    ultimoLancio.dati.abilita = ultimoLancio.dati.abilita.map(d => (d === 6) ? d : Math.floor(Math.random() * 6) + 1);
    
    // 3. Dadi Extra: tieni solo i 6, rilancia il resto
    ultimoLancio.dati.extra = ultimoLancio.dati.extra.map(d => (d === 6) ? d : Math.floor(Math.random() * 6) + 1);

    renderLancio(); // Mostra il nuovo risultato nel log
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

function generatoreWidgetSemplice(idx, label, valore, campoDinamico) {
    return `
        <div class="counter-item">
            <label>${label}</label>
            <div class="control-group">
                <button onclick="modificaCampoDiretto(${idx}, '${campoDinamico}', -1)">-</button>
                <span>${valore}</span>
                <button onclick="modificaCampoDiretto(${idx}, '${campoDinamico}', 1)">+</button>
            </div>
        </div>
    `;
}

function modificaCampoDiretto(index, campo, delta) {
    personaggi[index][campo] += delta;
    if (personaggi[index][campo] < 0) personaggi[index][campo] = 0;
    mostraScheda(index); // Rinfresca la scheda
}


window.onload = init;