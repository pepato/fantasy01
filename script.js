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



/* --- FUNZIONE DI ASSEMBLAGGIO --- */

function costruisciSchedaHTML(index) {
    const p = personaggi[index];
    const sheet = document.getElementById('character-sheet');
    
    // Inizializzazione valori attuali
    p.forza_attuale = p.forza_attuale || parseInt(p.Forza);
    p.agilita_attuale = p.agilita_attuale || parseInt(p.Agilità);
    p.acume_attuale = p.acume_attuale || parseInt(p.Acume);
    p.empatia_attuale = p.empatia_attuale || parseInt(p.Empatia);

    // Assembliamo la scheda
    let html = creaHeaderScheda(p);
    html += creaSezioneAttributi(p, index);
    
    // Aggiunta dinamica abilità
    html += `<div class="skills-section"><h3>Abilità</h3>`;
    Object.keys(abilitàSuAttributo).forEach(nomeAbil => {
        if(p[nomeAbil] !== undefined && p[nomeAbil] !== "") {
            html += generaRigaAbilità(p, nomeAbil, index);
        }
    });
    html += `</div>`;

    sheet.innerHTML = html;
}

/* --- HELPER PER I BOTTONI + e - DEGLI ATTRIBUTI --- */
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

/* --- COMPONENTI UI (I "Mattoncini") --- */

function creaHeaderScheda(p) {
    return `
        <div class="character-header">
            <button onclick="chiudiScheda()" class="btn-back">⬅ Torna alla lista</button>
            <h2>${p.Nome}</h2>
            <p><em>"${p.Soprannome}"</em></p>
            <h3>${p.Stirpe} - ${p.Professione}</h3>
        </div>`;
}

function creaSezioneAttributi(p, index) {
    return `
        <div class="stats-grid">
            <h3>Attributi (Danni/Malus)</h3>
            ${generatoreWidgetAttributo(index, 'Forza', p.forza_attuale)}
            ${generatoreWidgetAttributo(index, 'Agilità', p.agilita_attuale)}
            ${generatoreWidgetAttributo(index, 'Acume', p.acume_attuale)}
            ${generatoreWidgetAttributo(index, 'Empatia', p.empatia_attuale)}
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
    
    const l = ultimoLancio;
    
    // Calcolo successi (tutti i 6)
    const successi = [...l.dati.base, ...l.dati.abilita, ...l.dati.extra].filter(d => d === 6).length;
    // Calcolo traumi (solo gli 1 sui dadi BASE)
    const traumi = l.dati.base.filter(d => d === 1).length;

    const div = document.createElement('div');
    div.className = 'lancio-container';
    
    div.innerHTML = `
        <div class="lancio-header">
            <strong>${l.label}</strong><br>
            <span class="res-succ">✨ Successi: ${successi}</span> | 
            <span class="res-traum">💀 Teschi (Base): ${traumi}</span>
        </div>
        <div class="pool-visual">
            <div class="dice-group">
                <small>Base</small>
                <div class="dice-list base">${visualizzaDadi(l.dati.base)}</div>
            </div>
            <div class="dice-group">
                <small>Abilità</small>
                <div class="dice-list abilita">${visualizzaDadi(l.dati.abilita)}</div>
            </div>
            <div class="dice-group">
                <small>Extra</small>
                <div class="dice-list extra">${visualizzaDadi(l.dati.extra)}</div>
            </div>
        </div>
        <button class="btn-push" onclick="spingiTiro()">Spingi il Tiro! ⚡</button>
        <hr>
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



window.onload = init;