import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, DiscordAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURATIONS ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    appId: "YOUR_APP_ID"
};

const WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL";
const LOGO_URL = "YOUR_LOGO_URL_HERE"; 
const LTC_WALLET = "YOUR_LTC_ADDRESS";
const USDT_WALLET = "YOUR_USDT_TRC20_ADDRESS";

// Update Logo
document.getElementById('mainLogo').src = LOGO_URL;

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new DiscordAuthProvider();

// Login/Logout Logic
document.getElementById('loginBtn').onclick = () => signInWithPopup(auth, provider);
document.getElementById('logoutBtn').onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('authSection');
    if (user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('userName').innerText = user.displayName;
        document.getElementById('userAvatar').src = user.photoURL;
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('userProfile').style.display = 'none';
    }
});

// Modal Logic
window.openModal = () => document.getElementById('orderModal').style.display = 'flex';
window.closeModal = () => document.getElementById('orderModal').style.display = 'none';

let selectedMethod = '';
document.getElementById('ltcBtn').onclick = () => selectMethod('LTC');
document.getElementById('usdtBtn').onclick = () => selectMethod('USDT');

function selectMethod(m) {
    selectedMethod = m;
    document.querySelectorAll('.pay-item').forEach(i => i.classList.remove('active'));
    document.getElementById(m.toLowerCase() + 'Btn').classList.add('active');
    document.getElementById('addrBox').style.display = 'block';
    document.getElementById('methodName').innerText = `Send ${m} to:`;
    document.getElementById('walletAddr').innerText = (m === 'LTC') ? LTC_WALLET : USDT_WALLET;
}

// Order Form Submit
document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    if(!auth.currentUser) return alert("Please login first!");
    if(!selectedMethod) return alert("Select payment method!");

    const payload = {
        "content": "@here 🚀 **New Premium Order Received!**",
        "embeds": [{
            "title": "Tempo Music Premium",
            "color": 12325886,
            "thumbnail": { "url": auth.currentUser.photoURL },
            "fields": [
                { "name": "Customer", "value": `**${auth.currentUser.displayName}**`, "inline": true },
                { "name": "Payment", "value": `\`${selectedMethod}\``, "inline": true },
                { "name": "Server ID", "value": `\`${document.getElementById('serverId').value}\`` },
                { "name": "Invite Link", "value": document.getElementById('inviteLink').value }
            ]
        }]
    };

    const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    if(res.ok) {
        alert("Order submitted! We will contact you soon.");
        closeModal();
    }
};
