const dbPromise = idb.open('feeds-store', 1, DB => {
    if (!DB.objectStoreNames.contains('feeds')) {
        DB.createObjectStore('feeds', { keyPath: 'publishedAt' });
        DB.createObjectStore('savedPost', { keyPath: 'publishedAt' });
       
    }
});

function clearDataAll(storeName){
    return dbPromise
    .then(db=>{
        var tx = db.transaction(storeName, 'readwrite');
        var store = tx.objectStore(storeName);
        store.clear();
        return tx.complete;
        
    })
}

function readAllData(storeName){
    return dbPromise
    .then(db=>{
        var tx = db.transaction(storeName, 'readonly');
        var store = tx.objectStore(storeName);
        return store.getAll();
               
    })
}