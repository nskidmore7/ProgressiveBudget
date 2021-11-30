let db;
let budgetVersion;

const request = indexedDB.open('budget_tracker', budgetVersion);

request.onupgradeneeded = function(e) {

    const { oldVersion } = e;
    const newVersion = e.newVersion || db.version;

    console.log(`DB updated from ${oldVersion} to ${newVersion}`);

    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
      db.createObjectStore('BudgetStore', { autoIncrement: true })
    }
};

request.onerr = function(e) {

    db = e.target.result;

    if (navigator.onLine) {
      uploadTransaction();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {

    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const  budgetObjectStore = transaction.objectStore('new_transaction');
    
    if(Number(record.value)>0){
        alert(`You have added an deposit of $${Math.abs(Number(record.value))}.`);
    } else {
        alert(`You have added a expence of $${Math.abs(Number(record.value))}.`);
    }
 
    budgetObjectStore.add(record);
}

function uploadTransaction() {

    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    const budgetObjectStore = transaction.objectStore('new_transaction');
  
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {

    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');

          const budgetObjectStore = transaction.objectStore('new_transaction');
  
          budgetObjectStore.clear();

          alert('All saved transactions has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadTransaction);