// Firebase loader (an ES module, so it loads after the plain scripts). It exposes a small API on
// window.SR_FIREBASE for js/cloudsave.js and fires 'sr-firebase' when ready. Firebase web config values
// are public by design; what protects saves is the Firestore security rules (see CLAUDE.md).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBW3W-NovJ7NMWHqT3onXCUH1rFhCn8wUU',
  authDomain: 'sundered-reach.firebaseapp.com',
  projectId: 'sundered-reach',
  storageBucket: 'sundered-reach.firebasestorage.app',
  messagingSenderId: '622675847127',
  appId: '1:622675847127:web:d9302ee760f399cdb48d92'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const saveDoc = uid => doc(db, 'saves', uid); // one document per player: saves/{uid}

window.SR_FIREBASE = {
  // cb(user) with {uid, name} or null; fires once at start-up and on every sign-in or sign-out
  onUser(cb){ return onAuthStateChanged(auth, u => cb(u ? {uid: u.uid, name: u.displayName || u.email || 'your Google account'} : null)); },
  async signIn(){
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); }
    catch (e) {
      // Some phones and in-app browsers block popups: fall back to a full-page redirect
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return signInWithRedirect(auth, provider);
      throw e;
    }
  },
  signOut: () => signOut(auth),
  async read(uid){ const s = await getDoc(saveDoc(uid)); return s.exists() ? s.data() : null; },
  write: (uid, data) => setDoc(saveDoc(uid), data),
  remove: uid => deleteDoc(saveDoc(uid))
};
window.dispatchEvent(new Event('sr-firebase'));
