	    const selectMinuti = document.getElementById('filter-minuti-lavoro');

        for (let i = 0; i <= 59; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i.toString().padStart(2, '0');
            if (i === 6) opt.selected = true; // Imposta 06 come default
            selectMinuti.appendChild(opt);
        }
		
 		selectMinuti.onchange = () => { 
            refreshUI(); 
            document.getElementById('entrata').dispatchEvent(new Event('change'));
        };
		
		const selectOre = document.getElementById('filter-ore-lavoro');

        for (let i = 0; i <= 10; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i.toString().padStart(2, '0');
            if (i === 8) opt.selected = true; // Imposta 08 come default
            selectOre.appendChild(opt);
        }
		
		selectOre.onchange = () => { 
            refreshUI(); 
            document.getElementById('entrata').dispatchEvent(new Event('change')); 
        };
		
		const selectRientri = document.getElementById('filter-rientri-mensili');

        for (let i = 0; i <= 10; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i.toString();
			if (i === 4) opt.selected = true;
            selectRientri.appendChild(opt);
        }
		
		selectRientri.onchange = () => { refreshUI(); };
		
		document.getElementById('btn-manuale').onclick = () => {
            window.location.href = '/download-manuale';
        };
		
		document.addEventListener('DOMContentLoaded', function() {
            const btnConfig = document.getElementById('btn-config'); 
            const btnCloseConfig = document.getElementById('btn-chiudi-config');
			const btnApplicaConfig = document.getElementById('btn-applica-config');
            const configBox = document.getElementById('config-box');
        
            // Mostra il box al click su Configura
            if (btnConfig) {
                btnConfig.addEventListener('click', () => {
                    configBox.style.display = 'block';
                });
            }
			
			// Applica modifiche
            if (btnApplicaConfig) {
                btnApplicaConfig.addEventListener('click', () => {
				    // applica le modifiche 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        
            // Nasconde il box al click su Chiudi
            if (btnCloseConfig) {
                btnCloseConfig.addEventListener('click', () => {
                    configBox.style.display = 'none';
					window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        });
		
        let currentPage = 1;
        let pageSize = 30;
        let orderedRecords = [];
        let records = [];
        let filterMode = 'mese';
        const WORKDAY_MIN = 486;

        const pad = n => String(n).padStart(2, '0');
        const toMin = s => { if(!s || !s.includes(':')) return null; const [h,m]=s.split(':').map(Number); return h*60+m; };
        const fromMin = m => { const abs=Math.abs(m); return (m<0?'-':'')+pad(Math.floor(abs/60))+':'+pad(abs%60); };
         
		// Calcola i minuti totali di lavoro basandosi sulle select Ore e Minuti
        const getWorkdayMin = () => {
            const ore = parseInt(document.getElementById('filter-ore-lavoro').value) || 0;
            const minuti = parseInt(document.getElementById('filter-minuti-lavoro').value) || 0;
            return (ore * 60) + minuti;
        };
		
        let currentSortCol = 'date';
        let sortAsc = false;

        async function init() {
            const now = new Date();
            filterMode = 'mese'; 
            document.getElementById('filter-mese').value = pad(now.getMonth() + 1);
            document.getElementById('filter-anno').value = String(now.getFullYear());
            document.getElementById('filter-note').oninput = () => { currentPage = 1; refreshUI(); };
            await loadInitialData(); 
            updateHeaderLabels();
            updateFilterInteractivity();
            refreshUI(); 
            document.getElementById('theme-toggle').innerHTML = "☀️ Light Mode";
            setInterval(updateClock, 1000);
        }

        function sortBy(col) {
            if (currentSortCol === col) {
                sortAsc = !sortAsc;
            } else {
                currentSortCol = col;
                sortAsc = (col === 'date') ? false : true;
            }
            updateSortIcons();
            refreshUI();
        }

        function updateSortIcons() {
            const headers = {
                'date': 'th-date',
                'sede': 'th-sede',
                'entrata': 'th-entrata',
                'uscita': 'th-uscita',
                'presenza': 'th-presenza',
                'uscita_teorica': 'th-uscita-prev',     
                'diff': 'th-diff'
            };
            for (let key in headers) {
                const el = document.getElementById(headers[key]);
                if (el) {
                    if (key === currentSortCol) {
                        el.innerHTML = el.getAttribute('data-label') + (sortAsc ? ' ↑' : ' ↓');
                        el.classList.add('active-sort');
                    } else {
                        el.innerHTML = el.getAttribute('data-label') + ' ↕';
                        el.classList.remove('active-sort');
                    }
                }
            }
        }

        function updateSummaryCounters() {
        let minutiPresenzaTotali = 0;
        let minutiDifferenzaTotale = 0;
        let r_c = 0, s_c = 0, a_c = 0;
    
        const workdayMin = getWorkdayMin(); 
    
        if (Array.isArray(orderedRecords)) {
            orderedRecords.forEach(r => {
                const e = toMin(r.entrata);
                const u = toMin(r.uscita);
    
                if (r.sede !== 'Assenza' && e !== null) {
                    if (u !== null) {
                        minutiPresenzaTotali += (u - e);
                    }
    
                    // Allinea la base dell'entrata: se si entra prima delle 08:00, conta come 08:00
                    const baseMin = e < 480 ? 480 : e;
                    const utDinamica = baseMin + workdayMin;
    
                    if (u !== null) {
                        minutiDifferenzaTotale += (u - utDinamica);
                    }
                }
    
                if(r.sede === 'In Sede' || r.sede === 'Fuori Sede') r_c++;
                if(r.sede === 'Smart Working') s_c++;
                if(r.sede === 'Assenza') a_c++;
            });
        }
    
        // --- LOGICA PRESENZA: xgg yhh zmm ---
        const ggP = Math.floor(minutiPresenzaTotali / workdayMin);
        const restoP = minutiPresenzaTotali % workdayMin;
        const hhP = Math.floor(restoP / 60);
        const mmP = restoP % 60;
        const stringaPresenza = `${ggP}gg ${String(hhP).padStart(2, '0')}hh ${String(mmP).padStart(2, '0')}mm`;
    
        // --- LOGICA DIFFERENZA (con gestione segno +/-): xgg yhh zmm ---
        const isNegativo = minutiDifferenzaTotale < 0;
        const absDiff = Math.abs(minutiDifferenzaTotale);
        
        const ggD = Math.floor(absDiff / workdayMin);
        const restoD = absDiff % workdayMin;
        const hhD = Math.floor(restoD / 60);
        const mmD = restoD % 60;
    
        const segno = isNegativo ? "-" : "";
        const stringaDiff = `${segno}${ggD}gg ${String(hhD).padStart(2, '0')}hh ${String(mmD).padStart(2, '0')}mm`;
    
        // Aggiornamento UI dei contatori principali
        document.getElementById('tot-giornate').textContent = orderedRecords.length;
        document.getElementById('ore-presenza').textContent = stringaPresenza;
        
        const elDiff = document.getElementById('diff-totale');
        elDiff.textContent = stringaDiff;
        elDiff.classList.toggle('summary-danger', isNegativo);
    
        // --- LOGICA OBIETTIVO RIENTRI DINAMICO ---
        const rientriBaseMensili = parseInt(document.getElementById('filter-rientri-mensili').value) || 4;
        let obiettivoDinamico = rientriBaseMensili;
        const ora = new Date();
        
        const meseSelezionato = document.getElementById('filter-mese').value;
        
        if (meseSelezionato !== "") {
            obiettivoDinamico = rientriBaseMensili;
        } else if (filterMode === 'archivio') {
            obiettivoDinamico = rientriBaseMensili * 12;
        } else if (filterMode === 'anno') {
            const mesiPassati = ora.getMonth() + 1;
            obiettivoDinamico = rientriBaseMensili * mesiPassati;
        } else {
            obiettivoDinamico = rientriBaseMensili;
        }
        
        const elRientri = document.getElementById('rientri');
        elRientri.textContent = `${r_c}/${obiettivoDinamico}`;
        elRientri.classList.toggle('summary-danger', r_c < obiettivoDinamico);
    
        document.getElementById('smart-count').textContent = s_c;
        document.getElementById('assenze-count').textContent = a_c;
    }

        function updateFilterInteractivity() {
            const filterMese = document.getElementById('filter-mese');
            const filterAnno = document.getElementById('filter-anno');
            const badgeMese = document.getElementById('badge-mese');
            const badgeAnno = document.getElementById('badge-anno');
            const now = new Date();
            filterMese.disabled = false;
            filterAnno.disabled = false;
            badgeMese.style.display = "none";
            badgeAnno.style.display = "none";
            if (filterMode === 'mese') {
                filterMese.value = pad(now.getMonth() + 1);
                filterAnno.value = String(now.getFullYear());
                filterMese.disabled = true;
                filterAnno.disabled = true;
                badgeMese.textContent = "AUTO";
                badgeMese.style.display = "inline-flex";
                badgeAnno.textContent = "AUTO";
                badgeAnno.style.display = "inline-flex";
            } else if (filterMode === 'anno') {
                filterAnno.value = String(now.getFullYear());
                filterAnno.disabled = true;
                badgeAnno.textContent = "AUTO";
                badgeAnno.style.display = "inline-flex";
            } else if (filterMode === 'archivio') {
                filterAnno.value = document.getElementById('anno-label').textContent;
                filterAnno.disabled = true;
                badgeAnno.textContent = "STORICO";
                badgeAnno.className = "chip warn";
                badgeAnno.style.display = "inline-flex";
            }
        }

        async function loadInitialData() {
            try {
                const r = await fetch('/records').then(res => res.json());
                records = Array.isArray(r) ? r : [];
                const backups = await fetch('/backups').then(res => res.json()).catch(()=>[]);
                const bSel = document.getElementById('backup-select');
                bSel.innerHTML = '<option value="">-- seleziona --</option>';
                backups.forEach(f => bSel.add(new Option(f, f)));
                const archives = await fetch('/archives').then(res => res.json()).catch(()=>[]);
                const aSel = document.getElementById('archive-select');
                aSel.innerHTML = '<option value="">-- seleziona --</option>';
                archives.forEach(f => aSel.add(new Option(f, f)));
                refreshUI();
            } catch (e) { console.error(e); }
        }

        function refreshUI() {
            const selectedMese = document.getElementById('filter-mese').value;
            const selectedAnno = document.getElementById('filter-anno').value;
            const sedeFiltro = document.getElementById('filter-sede-select').value;
            const noteFiltro = document.getElementById('filter-note').value.toLowerCase();
            let filtered = [...records];
            if (selectedAnno) filtered = filtered.filter(r => r.date.startsWith(selectedAnno));
            if (selectedMese) filtered = filtered.filter(r => r.date.split('-')[1] === selectedMese);
            if (sedeFiltro) filtered = filtered.filter(r => r.sede === sedeFiltro);
            if (noteFiltro) filtered = filtered.filter(r => String(r.note || "").toLowerCase().includes(noteFiltro));
            filtered.sort((a, b) => {
                let valA, valB;
                if (currentSortCol === 'diff') {
                    const getMin = (r) => (r.sede === 'Assenza') ? (sortAsc ? 999999 : -999999) : (toMin(r.uscita) - toMin(r.uscita_teorica)) || 0;
                    valA = getMin(a); valB = getMin(b);
                } else if (currentSortCol === 'presenza') {
                    const getPres = (r) => (r.sede === 'Assenza') ? null : (toMin(r.uscita) - toMin(r.entrata));
                    valA = getPres(a); valB = getPres(b);
                    if (valA === null && valB === null) return 0;
                    if (valA === null) return 1;
                    if (valB === null) return -1;
                } else {
                    valA = a[currentSortCol] || "";
                    valB = b[currentSortCol] || "";
                }
                if (valA < valB) return sortAsc ? -1 : 1;
                if (valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });
            orderedRecords = filtered;
            updateTableDisplay();
        }

        document.getElementById('filter-mese').onchange = () => { currentPage = 1; refreshUI(); };
        document.getElementById('filter-anno').onchange = () => { currentPage = 1; refreshUI(); };
        document.getElementById('filter-sede-select').onchange = () => { currentPage = 1; refreshUI(); };

        document.getElementById('btn-reset-filtri-avanzati').onclick = () => {
            const now = new Date();
            document.getElementById('filter-sede-select').value = "";
            document.getElementById('filter-note').value = "";
            if (filterMode === 'mese') {
                document.getElementById('filter-mese').value = pad(now.getMonth() + 1);
                document.getElementById('filter-anno').value = String(now.getFullYear());
            } else if (filterMode === 'anno') {
                document.getElementById('filter-mese').value = "";
                document.getElementById('filter-anno').value = String(now.getFullYear());
            } else if (filterMode === 'archivio') {
                document.getElementById('filter-mese').value = ""; 
                document.getElementById('filter-anno').value = document.getElementById('anno-label').textContent.trim();
            }
            currentPage = 1;
            refreshUI();
        };

        function renderTable(data) {
            const tbody = document.getElementById('tbody');
            if (!tbody) return;
            let rowsHtml = '';
			
			const workdayMin = getWorkdayMin();
			
            data.forEach(r => {
                const dateObj = new Date(r.date);
                const dayOfWeek = dateObj.getDay();
                const year = dateObj.getFullYear();
                const monthDay = r.date.substring(5);
                const fisse = ["01-01", "01-06", "04-25", "05-01", "06-02", "06-29", "08-15", "10-04", "11-01", "12-08", "12-25", "12-26"];
                const pasquaObj = getPasqua(year);
                const pasquettaObj = new Date(pasquaObj);
                pasquettaObj.setDate(pasquaObj.getDate() + 1);
                const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
                const isFissa = fisse.includes(monthDay);
                const isEaster = (dateObj.toDateString() === pasquaObj.toDateString() || dateObj.toDateString() === pasquettaObj.toDateString());
                const rowClass = (isWeekend || isFissa || isEaster) ? 'class="row-holiday"' : '';
                const u = toMin(r.uscita), e = toMin(r.entrata);
                let dStr = "-", pres = "-"; uscitaTeoricaDinamica = "-";
				
				if (e !== null && r.sede !== 'Assenza') {
                    const baseMin = e < 480 ? 480 : e; // Soglia 08:00
                    const utMin = baseMin + workdayMin;
                    uscitaTeoricaDinamica = fromMin(utMin);
                    
                    // Calcolo Differenza basato sull'uscita teorica appena calcolata
                    if (u !== null) {
                        dStr = fromMin(u - utMin);
                        pres = fromMin(u - e);
                    }
                }
				
                let entrataDisplay = r.entrata || '-';
                if (r.entrata && e !== null && e < 480) {
                    entrataDisplay = `${r.entrata} <span style="color: var(--primary); font-size: 0.9em; font-weight: bold;">(08:00)*</span>`;
                }
                
                rowsHtml += `
                    <tr ${rowClass}>
                        <td>${r.date.split('-').reverse().join('-')}</td>
                        <td>${r.sede || '-'}</td>
                        <td>${entrataDisplay}</td>
                        <td>${r.uscita || '-'}</td>
                        <td class="${(pres.startsWith('-') && pres.length > 1) ? 'summary-danger' : ''}">${pres}</td>
                        <td>${uscitaTeoricaDinamica}</td>
                        <td class="${(dStr.startsWith('-') && dStr.length > 1) ? 'summary-danger' : ''}">${dStr}</td>
                        <td>${r.note || '-'}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="editRow('${r.date}')">Modifica</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteRow('${r.date}')">Elimina</button>
                        </td>
                    </tr>`;
            });
            tbody.innerHTML = rowsHtml;
        }

        function getPasqua(y) {
            const a = y % 19, b = Math.floor(y / 100), c = y % 100,
                  d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
                  g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
                  i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
                  m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31);
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(y, month - 1, day);
        }

        document.getElementById('btn-salva').onclick = async () => {
            const rec = {
                date: document.getElementById('data').value,
                entrata: document.getElementById('entrata').value,
                sede: document.getElementById('sede').value,
                uscita: document.getElementById('uscita').value,
                note: document.getElementById('note').value
            };
            if(!rec.date) return alert("Data mancante");
            await fetch('/save', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(rec)});
            resetForm(); await loadInitialData();
        };

        document.getElementById('btn-elimina-tutto').onclick = async () => {
            if(confirm("⚠ CANCELLARE TUTTO?")){
                await fetch('/delete-all', { method:'DELETE' });
                records = []; renderTable([]); alert("Fatto!");
            }
        };

        document.getElementById('restore-backup').onclick = async () => {
            const filename = document.getElementById('backup-select').value;
            if(!filename) return alert("Scegli un backup");
            if (confirm("Ripristinare questo backup?")) {
                const res = await fetch('/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename }) }).then(r => r.json());
                if(res.success) { await loadInitialData(); }
            }
        };

        document.getElementById('carica-archivio').onclick = async () => {
            const filename = document.getElementById('archive-select').value;
            if (!filename) return alert("Scegli un archivio");
            try {
                const response = await fetch(`/archive/${encodeURIComponent(filename)}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    records = data; filterMode = 'archivio'; currentPage = 1;
                    const yearMatch = filename.match(/\d{4}/);
                    const displayYear = yearMatch ? yearMatch[0] : "Archivio";
                    document.getElementById('filter-anno').value = displayYear;
                    document.getElementById('filter-mese').value = "";
                    updateHeaderLabels(displayYear); updateFilterInteractivity(); refreshUI();
                }
            } catch (e) { console.error(e); }
        };

        document.getElementById('theme-toggle').onclick = function() {
            const isDark = document.body.classList.toggle('dark-mode');
            this.innerHTML = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        };

        window.editRow = (d) => {
            const r = records.find(x => x.date === d);
            if(r){
                document.getElementById('data').value = r.date || '';
                document.getElementById('sede').value = r.sede || '';
                document.getElementById('entrata').value = r.entrata || '';
                document.getElementById('uscita').value = r.uscita || '';
                document.getElementById('note').value = r.note || '';
				
				if (r.entrata) {
                    const s = toMin(r.entrata);
                    const baseMin = s < 480 ? 480 : s;
                    document.getElementById('uscita-teorica').value = fromMin(baseMin + getWorkdayMin());
                } else {
                    document.getElementById('uscita-teorica').value = '';
                }
				
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        window.deleteRow = async (d) => {
            if (!confirm(`Eliminare record del ${d.split('-').reverse().join('-')}?`)) return;
            try {
                const res = await fetch(`/delete/${encodeURIComponent(d)}`, { method: 'DELETE' }).then(r => r.json());
                if (res.success) await loadInitialData();
            } catch (e) { console.error(e); }
        };

        function updateHeaderLabels(customYear = null) {
            const mesi = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
            const now = new Date();
            document.getElementById('mese-label').textContent = (filterMode === 'mese') ? mesi[now.getMonth()] : "Tutto";
            document.getElementById('anno-label').textContent = customYear || now.getFullYear();
        }

        function updateClock() {
            const n = new Date();
            document.getElementById('date-display').textContent = n.toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long'});
            document.getElementById('time-display').textContent = n.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
        }

        document.getElementById('btn-mese-corrente').onclick = async () => {
            const now = new Date(); filterMode = 'mese';
            document.getElementById('filter-mese').value = pad(now.getMonth() + 1);
            document.getElementById('filter-anno').value = String(now.getFullYear());
            await loadInitialData(); updateHeaderLabels(); updateFilterInteractivity();
        };

        document.getElementById('btn-anno-corrente').onclick = async () => {
            const now = new Date(); filterMode = 'anno';
            document.getElementById('filter-mese').value = "";
            document.getElementById('filter-anno').value = String(now.getFullYear());
            await loadInitialData(); updateHeaderLabels(); updateFilterInteractivity();
        };

        document.getElementById('entrata').onchange = (e) => {
            const s = toMin(e.target.value); 
            if(!s) return;
            const baseMin = s < 480 ? 480 : s; // Gestione soglia 08:00
            
            // Usiamo getWorkdayMin() invece della vecchia costante
            document.getElementById('uscita-teorica').value = fromMin(baseMin + getWorkdayMin());
        };

        function resetForm() { document.querySelectorAll('.form-grid input').forEach(i => i.value = ''); document.getElementById('sede').value = ''; }
        document.getElementById('btn-ripristina-form').onclick = resetForm;

        document.getElementById('exit-page').onclick = () => {
            if (confirm("Uscire?")) {
                document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:var(--bg);color:var(--text);"><h1>Applicazione Chiusa</h1><button onclick="location.reload()" class="btn btn-secondary">Rientra</button></div>';
            }
        };

        document.getElementById('export-csv').onclick = () => {
            if (!orderedRecords.length) return alert("Nulla da esportare.");
        
            // Intestazione CSV (Data; Sede; Entrata; Uscita; Presenza; Uscita Teorica; Differenza; Note)
            let csv = "Data;Sede;Entrata;Uscita;Presenza (h);Uscita Teorica;Differenza (h);Note\n";
            
            // Recuperiamo i minuti della giornata lavorativa configurata (es. 486 per 8h 06m)
            const workdayMin = getWorkdayMin();
        
            orderedRecords.forEach(r => {
                const e = toMin(r.entrata);
                const u = toMin(r.uscita);
                
                let dStr = "***";      // Differenza
                let pres = "***";      // Presenza effettiva
                let utDinamica = "***"; // Uscita Teorica calcolata run-time
        
                // Calcolo logica dinamica se non è un'assenza e c'è l'orario di entrata
                if (r.sede !== 'Assenza' && e !== null) {
                    // 1. Uscita Teorica: soglia 08:00 (480 min) + giornata lavorativa
                    const baseMin = e < 480 ? 480 : e;
                    const utMin = baseMin + workdayMin;
                    utDinamica = fromMin(utMin);
        
                    // 2. Presenza Effettiva (Uscita - Entrata reale)
                    if (u !== null) {
                        pres = fromMin(u - e);
                        // 3. Differenza (Uscita reale - Uscita Teorica)
                        dStr = fromMin(u - utMin);
                    }
                }
        
                // Creazione riga CSV
                const row = [
                    r.date.split('-').reverse().join('-'),          // Data
                    r.sede || '***',                                // Sede
                    r.entrata || '***',                             // Entrata
                    r.uscita || '***',                              // Uscita
                    pres,                                           // Presenza (h)
                    utDinamica,                                     // Uscita Teorica (AUTO)
                    dStr,                                           // Differenza (h)
                    (r.note || '').replace(/;/g, ',')               // Note (evitiamo conflitti con il separatore ;)
                ];
        
                csv += row.join(';') + "\n";
            });
        
            // Generazione del file con BOM per corretta lettura accenti in Excel
            const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Export_Registro_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        };

        function totalPages() { return Math.max(1, Math.ceil(orderedRecords.length / pageSize)); }
        function clampPage(p) { const tp = totalPages(); return Math.min(Math.max(1, p), tp); }
        function getPaginatedData() { const start = (currentPage - 1) * pageSize; return orderedRecords.slice(start, start + pageSize); }

        function renderPager() {
            const tp = totalPages();
            currentPage = clampPage(currentPage);
            const btns = document.getElementById('page-buttons');
            btns.innerHTML = '';
            let pages = tp <= 5 ? Array.from({ length: tp }, (_, i) => i + 1) : (currentPage <= 3 ? [1, 2, 3, '...', tp] : (currentPage >= tp - 2 ? [1, '...', tp - 2, tp - 1, tp] : [1, '...', currentPage, '...', tp]));
            pages.forEach(p => {
                if (p === '...') {
                    const span = document.createElement('span'); span.textContent = '...'; span.className = 'px-2 align-self-center'; btns.appendChild(span);
                } else {
                    const b = document.createElement('button');
                    b.className = p === currentPage ? 'btn btn-primary btn-sm' : 'btn btn-outline-secondary btn-sm';
                    b.textContent = p; b.style.minWidth = "35px";
                    b.onclick = () => { currentPage = p; updateTableDisplay(); };
                    btns.appendChild(b);
                }
            });
            document.getElementById('first-page').disabled = currentPage === 1;
            document.getElementById('prev-page').disabled = currentPage === 1;
            document.getElementById('next-page').disabled = currentPage === tp;
            document.getElementById('last-page').disabled = currentPage === tp;
            document.getElementById('page-info').textContent = `Pagina ${currentPage} di ${tp} (${orderedRecords.length} totali)`;
        }

        function updateTableDisplay() {
            currentPage = clampPage(currentPage);
            renderTable(getPaginatedData());
            renderPager();
            renderViewStatus();
            updateSummaryCounters();
        }

        document.getElementById('first-page').onclick = () => { currentPage = 1; updateTableDisplay(); };
        document.getElementById('last-page').onclick = () => { currentPage = totalPages(); updateTableDisplay(); };
        document.getElementById('prev-page').onclick = () => { currentPage--; updateTableDisplay(); };
        document.getElementById('next-page').onclick = () => { currentPage++; updateTableDisplay(); };
        document.getElementById('page-size').onchange = (e) => { pageSize = parseInt(e.target.value); currentPage = 1; updateTableDisplay(); };

        function renderViewStatus() {
            const chipOrigin = document.getElementById('chip-origin');
            document.getElementById('status-origin').textContent = filterMode === 'archivio' ? "Archivio Storico" : "Database Locale";
            chipOrigin.className = filterMode === 'archivio' ? "chip warn" : "chip info";
            document.getElementById('status-view').textContent = filterMode.toUpperCase();
            let active = [];
            if (document.getElementById('filter-mese').value && !document.getElementById('filter-mese').disabled) active.push("Mese: " + document.getElementById('filter-mese').value);
            if (document.getElementById('filter-sede-select').value) active.push(document.getElementById('filter-sede-select').value);
            if (document.getElementById('filter-note').value.trim()) active.push(`"${document.getElementById('filter-note').value.trim()}"`);
            document.getElementById('status-filters').textContent = active.length ? active.join(' + ') : "Nessun filtro";
            const total = orderedRecords.length;
            document.getElementById('status-counts').textContent = total ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} di ${total}` : "0 di 0";
        }

        window.onload = init;
