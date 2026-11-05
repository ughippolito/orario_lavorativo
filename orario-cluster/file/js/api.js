async function apiLoadRecords() {
    return fetch('/records').then(r => r.json());
}

async function apiLoadBackups() {
    return fetch('/backups').then(r => r.json());
}

async function apiLoadArchives() {
    return fetch('/archives').then(r => r.json());
}
