// DOM Elements
const elements = {
    connectWallet: document.getElementById('connect-wallet'),
    claimButton: document.getElementById('claim-btn'),
    claimRocketswap: document.getElementById('claim-rocketswap'),
    claimLamden: document.getElementById('claim-lamden'),
    claimRocketswapStake: document.getElementById('claim-rocketswap-staked'),
    sectionWhereToBridge: document.getElementById('where-to-bridge'),
    sectionWhatToBridge: document.getElementById('what-to-bridge'),
    backToStart: document.querySelectorAll('.back-to-start'),
    claimGithub: document.getElementById('claim-github'),
    connectGithub: document.getElementById('connect-github'),
};

// State Variables
let address = '';
let connected = false;
let currentPage = 1;
let airdrop = "";
let githubToken = null;

// Initialize Xian Wallet
XianWalletUtils.init('https://node.xian.org');

// Utility Functions
const showToast = (message, type) => {
    bulmaToast.toast({ message, type, position: "top-center", duration: 5000 });
};

const updateConnectWalletElement = (info) => {
    elements.connectWallet.innerHTML = `Connected as ${info.address.substring(0, 6)}...${info.address.substring(info.address.length - 4)}`;
    elements.connectWallet.classList.add('disabled');
};

const handleWalletError = (error) => {
    console.error('Wallet error:', error);
    showToast("Make sure you have the Xian wallet installed and unlocked", "is-danger");
};

async function claim() {
    if (!connected) {
        showToast("Please connect your Xian wallet first", "is-danger");
        return;
    }

    XianWalletUtils.signMessage("Airdrop Claim")
    .then(response => {
        let signature = response.signature;
        let url = "https://airdropsapi.xian.org";

        if (airdrop === "lamden") {
            url += "/claim_lamden_airdrop";
        }
        else if (airdrop === "rocketswap") {
            url += "/claim_rocketswap_airdrop";
        }
        else if (airdrop === "rocketswap-stake") {
            url += "/claim_rocketswap_staking_airdrop";
        }
        else if (airdrop === "github") {
            if (!githubToken) {
                showToast("Please connect your GitHub account first", "is-danger");
                return;
            }
            fetch(url + "/claim_github_airdrop", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    xian_address: address,
                    signature: signature,
                    github_token: githubToken
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, "is-success");
                } else {
                    showToast(data.message, "is-danger");
                }
            })
            .catch(() => showToast("Error sending request", "is-danger"));
            return;
        }

        fetch(url+`?xian_address=${address}&signature=${signature}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                showToast(data.message, "is-success");
            } else {
                showToast(data.message, "is-danger");
            }
        })
    })
    .catch(error => {
        showToast("Error signing message", "is-danger");
    });
}

// Event Listeners
elements.connectWallet.addEventListener('click', () => {
    XianWalletUtils.requestWalletInfo()
        .then((info) => {
            console.log('Wallet info:', info);
            
            if (info.locked) {
                showToast("Please unlock your Xian wallet", "is-danger");
            } else {
                if (info.chainId !== 'xian-network-3') {
                    showToast("Please switch to the Xian Mainnet", "is-danger");
                    return;
                }
                address = info.address;
                updateConnectWalletElement(info);
                connected = true;
                elements.claimButton.classList.remove('disabled');
            }
        })
        .catch(handleWalletError);
});

// Navigation Handlers
elements.backToStart.forEach((element) => {
    element.addEventListener('click', () => {
        elements.sectionWhereToBridge.classList.remove('d-none');
        elements.sectionWhatToBridge.classList.add('d-none');
        currentPage = 1;
        direction = '';
    });
});

elements.claimLamden?.addEventListener('click', () => {
    elements.sectionWhereToBridge.classList.add('d-none');
    elements.sectionWhatToBridge.classList.remove('d-none');
    currentPage = 2;
    airdrop = "lamden";
});

elements.claimRocketswap?.addEventListener('click', () => {
    elements.sectionWhereToBridge.classList.add('d-none');
    elements.sectionWhatToBridge.classList.remove('d-none');
    currentPage = 2;
    airdrop = "rocketswap";
});

elements.claimRocketswapStake?.addEventListener('click', () => {
    elements.sectionWhereToBridge.classList.add('d-none');
    elements.sectionWhatToBridge.classList.remove('d-none');
    currentPage = 2;
    airdrop = "rocketswap-stake";
});

elements.claimGithub?.addEventListener('click', () => {
    // redirect to GitHub OAuth flow
    const client_id = "Ov23liIrn9nThui8Ccgy";
    const redirect_uri = window.location.origin;
    const scope = "read:user";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}`;
});

// To be called after redirect
window.processGithubCode = function(code) {
    fetch(`https://airdropsapi.xian.org/github_token_exchange?code=${code}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.token) {
                githubToken = data.token;
                showToast("GitHub connected successfully!", "is-success");
                elements.connectGithub.classList.add("disabled");
                airdrop = "github";
                elements.sectionWhereToBridge.classList.add('d-none');
                elements.sectionWhatToBridge.classList.remove('d-none');
            } else {
                showToast("GitHub authentication failed", "is-danger");
            }
        })
        .catch(() => showToast("Error during GitHub auth", "is-danger"));
};

elements.claimButton.addEventListener('click', claim);

// Burger menu
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubCode = urlParams.get('code');
    if (githubCode) {
        window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
        window.processGithubCode(githubCode);
    }

    const burger = document.getElementById('burger');
    const menu = document.getElementById('navbarBasicExample');

    if (burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }
});