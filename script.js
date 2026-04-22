import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, DiscordAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    appId: "YOUR_APP_ID"
};

const WEBHOOK_URL = "YOUR_WEBHOOK_URL";
const LTC_ADDR = "YOUR_LTC_ADDRESS";
const USDT_ADDR = "YOUR_USDT_ADDRESS";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new DiscordAuthProvider();
provider.addScope('guilds'); // Mandatory for server list

// --- Auth State ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('userName').innerText = user.displayName;
        document.getElementById('userAvatar').src = user.photoURL;
        document.getElementById('dashboard').style.display = 'block';
        fetchUserServers();
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
    }
});

document.getElementById('loginBtn').onclick = () => signInWithPopup(auth, provider);
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// --- Fetch Servers ---
async function fetchUserServers() {
    // In a real OAuth flow, you'd use the access token. 
    // This is a simulation logic for UI demonstration.
    const container = document.getElementById('serverList');
    container.innerHTML = `<p style="color:var(--primary)">Scanning for Administrator Permissions...</p>`;
    
    // Note: To get real guilds, you must pass the Access Token from provider result.
    // Here is how you display them once you have the data:
    setTimeout(() => {
        container.innerHTML = `
            <div class="server-card glass">
                <img src="https://cdn.discordapp.com/embed/avatars/1.png">
                <h4>My Community</h4>
                <button class="invite-btn" onclick="window.open('YOUR_INVITE_LINK')">Invite Bot</button>
            </div>
        `;
    }, 1500);
}

// --- Order System ---
window.openOrderModal = (plan, price) => {
    document.getElementById('modalTitle').innerText = `Order: ${plan} (${price})`;
    document.getElementById('orderModal').style.display = 'flex';
};

window.closeModal = () => document.getElementById('orderModal').style.display = 'none';

let selectedMethod = '';
document.getElementById('ltcBtn').onclick = () => {
    selectedMethod = 'LTC';
    showAddr(LTC_ADDR);
};
document.getElementById('usdtBtn').onclick = () => {
    selectedMethod = 'USDT';
    showAddr(USDT_ADDR);
};

function showAddr(addr) {
    const box = document.getElementById('addrBox');
    box.style.display = 'block';
    document.getElementById('walletAddr').innerText = addr;
}

document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        content: "@here **Premium Request!**",
        embeds: [{
            title: "New Premium Order",
            fields: [
                { name: "User", value: auth.currentUser.displayName },
                { name: "Server ID", value: document.getElementById('serverId').value },
                { name: "Plan", value: document.getElementById('modalTitle').innerText }
            ]
        }]
    };
    await fetch(WEBHOOK_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    alert("Order Sent to Discord!");
    closeModal();
};
