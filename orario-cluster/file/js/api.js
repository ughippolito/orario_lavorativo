async function apiLoadRecords() {
    return fetch('/records').then(r => r.json());
}

async function apiLoadBackups() {
    return fetch('/backups').then(r => r.json());
}

async function apiLoadArchives() {
    return fetch('/archives').then(r => r.json());
}

async function apiSaveRecord(rec) {
    return fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rec)
    });
}

async function apiDeleteRecord(date) {
    return fetch(`/delete/${encodeURIComponent(date)}`, {
        method: 'DELETE'
    }).then(r => r.json());
}

async function apiDeleteAll() {
    return fetch('/delete-all', {
        method: 'DELETE'
    });
}

async function apiRestoreBackup(filename) {
    return fetch('/restore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
    }).then(r => r.json());
}

async function apiLoadArchive(filename) {
    return fetch(`/archive/${encodeURIComponent(filename)}`)
        .then(r => r.json());
}
