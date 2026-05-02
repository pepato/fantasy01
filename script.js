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

function lanciaPool(etichetta, nomeAttr, numBase, numAbilità) {
    const numExtra = parseInt(document.getElementById('extra-dice').value) || 0;

    ultimoLancio = {
        label: etichetta,
        attributo: nomeAttr,
        dati: {
            base: generaDadi(numBase),
            abilita: generaDadi(numAbilità),
            extra: generaDadi(numExtra)
        }
    };

    renderLancio();
    // Resettiamo i dadi extra a 0 dopo il lancio per sicurezza
    document.getElementById('extra-dice').value = 0;
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


// CONSOLE LOG
Object.keys(abilitàSuAttributo).forEach(nomeAbil => {
    console.log(`Sto cercando l'abilità: ${nomeAbil}. Valore nel foglio:`, p[nomeAbil]);
    
    if(p[nomeAbil]) {
        html += generaRigaAbilità(p, nomeAbil);
     }
    });
}

window.onload = init;