let db;
const s = 'Store'

const request = window.indexedDB.open("TransactionDB", 1);

request.onsuccess = (e) => {
    db = e.target.result;

    if (navigator.onLine) {
        checkDB();
    }
};

request.onerror = (e) => {
    console.log(error);
};

request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore("s", { autoIncrement: true });
};

const saveRecord = (record) => {
    const transaction = db.transaction(["s"], "readwrite");
    const thisStore = transaction.objectStore("s");

    thisStore.add(record);
};

const checkDB = () => {
    const transaction = db.transaction(["s"], "readwrite");
    const thisStore = transaction.objectStore("s");
    const getData = thisStore.getAll();

    getData.onsuccess = () => {
        if (getData.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getData.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["s"], "readwrite");
                    const store = transaction.objectStore("s");
                    store.clear();
                });
        };
    };
};

window.addEventListener("online", checkDB);