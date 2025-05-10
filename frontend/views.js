async function openDatabase() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("TSP_db");
        request.onupgradeneeded = (event) => {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("view")) {
                db.createObjectStore("view", { keyPath: "id" });
            }
        }
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    })
}

async function getStoredView() {
    const db = await openDatabase();
    const tx = db.transaction("view", "readwrite");
    const store = tx.objectStore("view");
    return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = (event) => resolve(event.target.result[0] || "frontPage");
        req.onerror = (event) => resolve("frontPage"); 
    })
}

document.addEventListener("DOMContentLoaded", async () => {
    async function navigate(viewId) {
        document.querySelectorAll(".pageView").forEach((view) => {
            view.style.display = "none";
        });
        document.getElementById(viewId).style.display = "block";
        const db = await openDatabase();
        const tx = db.transaction("view", "readwrite");
        const store = tx.objectStore("view");
        let clear_req = store.clear();
        clear_req.onsuccess = () => console.log("Cleared DB");
        clear_req.onerror = () => console.log("Error clearing DB");
        let add_req = store.add({
            id: viewId
        });
        add_req.onsuccess = () => console.log("Saved current view");
        add_req.onerror = () => console.log("Error saving current view");
        const event = new CustomEvent(viewId + "Switch");
        document.dispatchEvent(event);
    }

    const navigationButtons = [
        ["frontPage", "specifyingInfoPage"],
        ["specifyingInfoPage", "loadingScreen"],
        ["loadingScreen", "generatedItineraryPage"],
        ["generatedItineraryPage", "specifyingInfoPage"],
        ["backHome", "frontPage"]
    ].map(([fromPage, toPage]) => [document.getElementById(fromPage + "Button"), toPage])
    console.log(navigationButtons)
    navigationButtons.forEach(([button, viewId]) => {
        button.addEventListener("click", () => navigate(viewId))
    });
    const storedView = (await getStoredView()).id || "frontPage";
    navigate(storedView);
})

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.fact-item').forEach(item => {
        const hoverImg = item.querySelector('.hover-img');
        if (hoverImg) {
            hoverImg.style.display = 'none';
            hoverImg.style.maxWidth = '150px';
            hoverImg.style.marginTop = '8px';
            hoverImg.style.borderRadius = '8px';
            hoverImg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            hoverImg.style.transition = 'opacity 0.3s ease';
            hoverImg.style.opacity = '0';
            item.addEventListener('mouseenter', () => {
                hoverImg.style.display = 'block';
                requestAnimationFrame(() => {
                    hoverImg.style.opacity = '1';
                });
            });
            item.addEventListener('mouseleave', () => {
                hoverImg.style.opacity = '0';
                setTimeout(() => {
                    hoverImg.style.display = 'none';
                }, 300);
            });
        }
    });

    function getCurrentUserId() {
        return localStorage.getItem("userId");
    }

    document.getElementById("setUserIdBtn").addEventListener("click", async () => {
        const input = document.getElementById("userIdInput").value.trim();
        if (!input) {
            alert("Please enter a valid user ID.");
            return;
        }
        const userId = String(input);
        localStorage.setItem("userId", userId);
        await fetch("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                currentView: "frontPage",
                currentLanguage: "en",
                currentTheme: "light"
            })
        });
    });
    
    document.getElementById("deleteAllButton").addEventListener("click", async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            alert("User ID not found.");
            return;
        }
        const confirmDelete = confirm("Are you sure you want to delete all your stored data?");
        if (confirmDelete) {
            const res = await fetch(`/users/${userId}`, { method: "DELETE" });
            const result = await res.json();
            alert(result.message);
            localStorage.removeItem("userId");
        }
    });
    
    async function updateUserSetting(data) {
        const userId = getCurrentUserId();
        if (!userId) return;
        await fetch(`/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    }

    document.getElementById("loadingScreenButton").addEventListener("click", async () => {
        const response = await fetch("/view/" + getCurrentUserId(), {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({view: "generatedItineraryPage"})
        });
        const data = await response.json();
        console.log(data);
    })

    document.getElementById("loadingScreenButton").addEventListener("click", async () => {
        const response = await fetch("/locations/"  + getCurrentUserId(), {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({locations: {locationsId: 1, locations: []}})
        });
        const data = await response.json();
        console.log(data);
    })

        document.getElementById("search-btn").addEventListener("click", () => {
            const query = document.getElementById("search-bar").value.trim();
            if (!query) {
            alert("Please enter a search query.");
            return;
            }
            console.log("User searched for:", query);
        });
})

document.addEventListener('loadingScreenSwitch', ()=>{
    let progress = document.getElementById('progress');
    const goose=document.getElementById('goose');
    const progressBar=document.querySelector('.progress-bar');
    let percent = 0;
    progress.style.width = '0%';
    progress.textContent = '0%';
    goose.style.left = '0px';
    let interval = setInterval(() => {
        if (percent >= 100) {
            clearInterval(interval);
        } else {
            percent++;
            progress.style.width = percent + '%';
            progress.textContent = percent + '%';

            const barWidth = progressBar.offsetWidth - goose.offsetWidth;
            goose.style.left = (barWidth * (percent / 100)) + 'px';
        }
    }, 30);
})