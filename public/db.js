let db;

const request = window.indexedDB.open("budgetDB", 1);

request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore("budgetItems", { autoIncrement: true });
};

request.onsuccess = (e) => {
    db = e.target.result;

    if (navigator.onLine) {
        checkDB();
    }
};

request.onerror = (e) => {
    console.log(error);
};


const saveRecord = (record) => {
    const transaction = db.transaction(["budgetItems"], "readwrite");
    const thisStore = transaction.objectStore("budgetItems");

    thisStore.add(record);
};

const checkDB = () => {
    const transaction = db.transaction(["budgetItems"], "readwrite");
    const thisStore = transaction.objectStore("budgetItems");
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
                    const transaction = db.transaction(["budgetItems"], "readwrite");
                    const store = transaction.objectStore("budgetItems");
                    store.clear();
                });
        };
    };
};

window.addEventListener("online", checkDB);