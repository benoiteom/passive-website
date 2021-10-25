import { initializeApp } from '@firebase/app';
import { getDatabase } from '@firebase/database';

export const firebaseApp = initializeApp({
    apiKey: 'AIzaSyBiuTVcsuig3gX8xVFOAOPso5FPKotRrFg',
    authDomain: 'passive-1642.firebaseapp.com',
    databaseURL: 'https://passive-1642-default-rtdb.firebaseio.com',
    projectId: 'passive-1642',
    storageBucket: 'gs://passive-1642.appspot.com/'
});
export const db = getDatabase(firebaseApp);
