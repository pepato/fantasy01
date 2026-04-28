// FOGLIO SCRIPT //

// Aggiungiamo &headers=1 per obbligare Google a vedere la riga 2 come DATI
    const SHEET_ID = '1yKMR0kwBxOljcdl9gQvK5KYOhsZPGC0ZsuZwxaIlr9s';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1`;
    let characters = [];
    let myRadarChart = null; // Questa variabile tiene traccia del grafico attivo

// 1. Funzione per mostrare/nascondere il pannello
function toggleComparison() {
    const section = document.getElementById('comparison-section');
    if (!section) return;

    if (section.style.display === 'none') {
        section.style.display = 'block';
        
        // Popoliamo i menu a tendina con i nomi dei personaggi
        const s1 = document.getElementById('select-char-1');
        const s2 = document.getElementById('select-char-2');
        
        // Usiamo l'array 'characters' che abbiamo già popolato con i dati di Google
        const options = characters.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
        s1.innerHTML = options;
        s2.innerHTML = options;
        
        if (s2.options.length > 1) s2.selectedIndex = 1; // Seleziona il secondo PG di default

        // Aspettiamo un attimo che il CSS renderizzi il div prima di disegnarci dentro
        console.log("Sezione aperta, lancio updateComparison...");
        setTimeout(updateComparison, 300); // Ritardo per sicurezza
       
    } else {
        section.style.display = 'none';
    }
}

// 2. Funzione che disegna o aggiorna il grafico
function updateComparison() {
    const id1 = document.getElementById('select-char-1').value;
    const id2 = document.getElementById('select-char-2').value;
    
    // Troviamo i due personaggi scelti nell'array globale
    const char1 = characters.find(c => c.id === id1);
    const char2 = characters.find(c => c.id === id2);

    if (!char1 || !char2) return;

    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Se esiste già un grafico, dobbiamo distruggerlo prima di crearne uno nuovo
    if (myRadarChart) {
        myRadarChart.destroy();
    }

    // Creiamo il nuovo Radar Chart
    myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Forza', 'Agilità', 'Acume', 'Empatia'],
            datasets: [
                {
                    label: char1.nome,
                    data: [char1.forza, char1.agilita, char1.acume, char1.empatia],
                    backgroundColor: 'rgba(122, 0, 0, 0.4)', // Rosso per il PG 1
                    borderColor: '#7a0000',
                    borderWidth: 2
                },
                {
                    label: char2.nome,
                    data: [char2.forza, char2.agilita, char2.acume, char2.empatia],
                    backgroundColor: 'rgba(0, 100, 100, 0.4)', // Teal per il PG 2
                    borderColor: '#006464',
                    borderWidth: 2
                }
            ]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 6, // Limite tipico di Forbidden Lands
                    ticks: { stepSize: 1, display: false },
                    grid: { color: '#d9cbb3' },
                    angleLines: { color: '#d9cbb3' },
                    pointLabels: { font: { size: 14, family: 'Georgia, serif' } }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
    
    async function init() {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const json = JSON.parse(text.substring(47).slice(0, -2));
            const rows = json.table.rows;

            console.log("Righe totali ricevute da Google:", rows.length);

            // IMPORTANTE: Con &headers=1, Google ci manda SOLO i dati. 
            // Quindi NON usiamo più .slice(1), altrimenti salteremmo di nuovo il primo PG!
            characters = rows.map((row, index) => {
                const c = row.c;
                const v = (i) => (c && c[i] && c[i].v !== null) ? c[i].v : "";

                return {
                    id: v(0),
                    nome: v(1),
                    soprannome: v(2),
                    stirpe: v(3),
                    professione: v(4),
                    eta: v(5),
                    orgoglio: v(6),
                    segreto: v(7),
                    background: v(8),
                    ritratto: v(9),
                    volonta: v(10),
                    esperienza: v(11),
                    reputazione: v(12),
                    doteStirpe: v(13),
                    doteSentiero: v(14),
                    dotiAltro: [v(15), v(16), v(17)].filter(x => x && x !== "-"),
                    forza: v(18),
                    agilita: v(19),
                    acume: v(20),
                    empatia: v(21),
                    abilita: {
                        "Artigianato": v(22), "Mischia": v(23), "Resistenza": v(24), "Vigore": v(25),
                        "Furtività": v(26), "Mira": v(27), "Movimento": v(28), "Rapidità": v(29),
                        "Erudizione": v(30), "Intuito": v(31), "Percezione": v(32), "Sopravvivenza": v(33),
                        "Addestramento": v(34), "Esibizione": v(35), "Guarigione": v(36), "Persuasione": v(37)
                    }
                };
            }).filter(char => char.nome !== ""); // Rimuove eventuali righe vuote in fondo

            renderMaster();
            document.getElementById('loader').style.display = 'none';
        } catch (e) {
            document.getElementById('loader').innerHTML = "Errore nel caricamento dei dati.";
            console.error("Dettaglio errore:", e);
        }
    }

    function renderMaster() {
        const list = document.getElementById('master-list');
        list.innerHTML = characters.map(c => `
            <div class="char-card" onclick="showDetail('${c.id}')">
                <h2>${c.nome}</h2>
                <p>${c.soprannome}</p>
                <div style="margin-top:10px; color:var(--teal)">${c.stirpe} ${c.professione}</div>
            </div>
        `).join('');
    }

    function showDetail(id) {
        const c = characters.find(x => x.id == id);
        if (!c) return;
        
        const content = document.getElementById('sheet-content');
        const skillHtml = Object.entries(c.abilita)
            .filter(([_, val]) => val !== "" && val > 0)
            .map(([name, val]) => `<div class="skill-item"><span>${name}</span><span>${val}</span></div>`)
            .join('');

        content.innerHTML = `
            <div class="identity-section">
                <h1>${c.nome}</h1>
                <h2 style="font-style:italic; opacity:0.8">${c.soprannome}</h2>
                <p style="font-size:1.3rem"><strong>${c.stirpe}</strong> — <strong>${c.professione}</strong> — Età: ${c.eta}</p>
            </div>
            <div class="values-bar">
                <div class="val-item"><span class="val-num">${c.volonta}</span>VOLONTÀ</div>
                <div class="val-item"><span class="val-num">${c.esperienza}</span>ESPERIENZA</div>
                <div class="val-item"><span class="val-num">${c.reputazione}</span>REPUTAZIONE</div>
            </div>
            <div class="sheet-body">
                <div class="left-col">
                    <div class="attr-grid">
                        <div class="attr-box"><span class="attr-label">Forza</span><span class="attr-val">${c.forza}</span></div>
                        <div class="attr-box"><span class="attr-label">Agilità</span><span class="attr-val">${c.agilita}</span></div>
                        <div class="attr-box"><span class="attr-label">Acume</span><span class="attr-val">${c.acume}</span></div>
                        <div class="attr-box"><span class="attr-label">Empatia</span><span class="attr-val">${c.empatia}</span></div>
                    </div>
                    <div class="box">
                        <h4>Abilità Addestrate</h4>
                        <div class="skill-grid">${skillHtml || 'Nessuna abilità particolare.'}</div>
                    </div>
                    <div class="box">
                        <h4>Doti e Talenti</h4>
                        <p><strong>Dote Stirpe:</strong> ${c.doteStirpe}</p>
                        <p><strong>Sentiero:</strong> ${c.doteSentiero}</p>
                        <p><strong>Altre:</strong> ${c.dotiAltro.join(", ") || "-"}</p>
                    </div>
                    <div class="box">
                        <h4>Cronache</h4>
                        <p style="white-space: pre-wrap;">${c.background}</p>
                    </div>
                </div>
                <div class="right-col">
                    <img src="${c.ritratto || 'https://via.placeholder.com/300x400'}" class="portrait">
                    <div class="box"><h4>Orgoglio</h4><p><em>"${c.orgoglio}"</em></p></div>
                    <div class="box"><h4>Segreto</h4><p><em>"${c.segreto}"</em></p></div>
                </div>
            </div>
        `;
        document.getElementById('master-list').style.display = 'none';
        document.getElementById('main-header').style.display = 'none';
        document.getElementById('detail-view').style.display = 'block';
        window.scrollTo(0,0);
    }

    function showMaster() {
        document.getElementById('detail-view').style.display = 'none';
        document.getElementById('master-list').style.display = 'grid';
        document.getElementById('main-header').style.display = 'block';
    }

    window.onload = init;
