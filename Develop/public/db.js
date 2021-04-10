let db;
const r = indexedDB.open("budget", 1);
//create object store for pending transactions
request.onupgradeneeded = function (e) {
  
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
//if object store was created successfully
request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};
//if err creating object store
request.onerror = function (e) {
  console.log(e.target.errorCode);
};
// saves pending record 
function saveRecord(rec) {
 
  const transaction = db.transaction(["pending"], "readwrite");

  const s = transaction.objectStore("pending");
//add pending record to db
  s.add(rec);
}
// check for pending transactions
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const s = transaction.objectStore("pending");
  const getAll = s.getAll();
//getting all pending transactions successful
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      //bulk process transactions
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(res => response.json())
        .then(() => {
          //clear pending transaction object store
          const transaction = db.transaction(["pending"], "readwrite");
          const s = transaction.objectStore("pending");

          s.clear();
        });
    }
  };
}
//add event listener to current window
window.addEventListener("online", checkDatabase);