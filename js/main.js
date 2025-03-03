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
};

// State Variables
let address = '';
let connected = false;
let currentPage = 1;
let airdrop = "";

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
                if (info.chainId !== 'xian-network-3')
                {
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

elements.claimLamden.addEventListener('click', () => {
    elements.sectionWhereToBridge.classList.add('d-none');
    elements.sectionWhatToBridge.classList.remove('d-none');
    currentPage = 2;
    airdrop = "lamden";

});

elements.claimRocketswap.addEventListener('click', () => {
    elements.sectionWhereToBridge.classList.add('d-none');
    elements.sectionWhatToBridge.classList.remove('d-none');
    currentPage = 2;
    airdrop = "rocketswap";
});

elements.claimRocketswapStake.addEventListener('click', () => {
    elements.sectionWhereToBridge.classList.add('d-none');
    elements.sectionWhatToBridge.classList.remove('d-none');
    currentPage = 2;
    airdrop = "rocketswap-stake";
});

elements.claimButton.addEventListener('click', claim);


// Burger menu
document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const menu = document.getElementById('navbarBasicExample');

    if (burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }
});
