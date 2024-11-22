document.addEventListener("DOMContentLoaded", () => {
    // Add event listener for adding links
    document.getElementById("addButton").addEventListener("click", addLink);

    // Add event listener for dark mode toggle
    document.getElementById("toggleDarkMode").addEventListener("click", toggleDarkMode);

    // Function to initialize and load stored links and gamification data when the extension loads
    function loadLinks() {
        chrome.storage.local.get(["links", "points", "achievements"], (data) => {
            const savedLinks = data.links || [];
            savedLinks.forEach((link) => addLinkToList(link));

            // Load points and achievements
            document.getElementById("pointsDisplay").textContent = `Points: ${data.points || 0}`;
            document.getElementById("achievementsDisplay").textContent = data.achievements || '';
        });
    }

    // Function to add a link to the list and store it in Chrome's storage
    function addLink() {
        const linkInput = document.getElementById("linkInput");
        const linkValue = linkInput.value.trim();

        if (linkValue) {
            addLinkToList(linkValue); // Add the link to the display
            updatePoints(5);  // Earn 5 points for adding a link

            chrome.storage.local.get("links", (data) => {
                const links = data.links || [];
                links.push(linkValue);
                chrome.storage.local.set({ links });
            });

            linkInput.value = ""; // Clear the input field
        }
    }

    // Helper function to create a list item for a link and add it to the display
    function addLinkToList(linkValue) {
        const linkList = document.getElementById("linkList");
        const listItem = document.createElement("li");

        const link = document.createElement("a");
        link.href = linkValue;
        link.target = "_blank";
        link.textContent = linkValue;

        // Copy button for each link
        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.classList.add("copy-btn");
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(linkValue).then(() => {
                alert("Link copied to clipboard!");
                updatePoints(1);  // Updated to add 1 point for copying a link
            }).catch(err => {
                console.error("Could not copy text:", err);
            });
        };

        // Remove button for each link
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.classList.add("remove-btn");
        removeBtn.onclick = () => {
            removeLink(listItem, linkValue);
            updatePoints(-3);  // Updated to deduct 3 points for removing a link
        };

        listItem.appendChild(link);
        listItem.appendChild(copyBtn);
        listItem.appendChild(removeBtn);
        linkList.appendChild(listItem);
    }

    // Function to remove a link from the display and Chrome's storage
    function removeLink(listItem, linkValue) {
        const linkList = document.getElementById("linkList");
        linkList.removeChild(listItem);

        // Update storage by removing the link
        chrome.storage.local.get("links", (data) => {
            const links = data.links || [];
            const updatedLinks = links.filter((link) => link !== linkValue);
            chrome.storage.local.set({ links: updatedLinks });
        });
    }

    // Function to update points
    function updatePoints(amount) {
        chrome.storage.local.get("points", (data) => {
            let points = data.points || 0;
            points += amount;
            chrome.storage.local.set({ points }, () => {
                document.getElementById("pointsDisplay").textContent = `Points: ${points}`;
                checkAchievements(points);
            });
        });
    }

    // Function to check for achievements based on points
    function checkAchievements(points) {
        let achievements = "";

        if (points >= 10) achievements += "🎉 10 Points! ";
        if (points >= 50) achievements += "🚀 50 Points! ";
        if (points >= 100) achievements += "🏆 100 Points! ";

        chrome.storage.local.set({ achievements }, () => {
            document.getElementById("achievementsDisplay").textContent = achievements;
        });
    }

    // Function to toggle dark mode
    function toggleDarkMode() {
        const body = document.body;
        const toggleButton = document.getElementById("toggleDarkMode");

        // Toggle the "dark-mode" class on the body
        body.classList.toggle("dark-mode");
        toggleButton.classList.toggle("active");
        // Update button text
        if (body.classList.contains("dark-mode")) {
            toggleButton.textContent = "Disable Dark Mode";
            chrome.storage.local.set({ darkMode: true }); // Save dark mode preference
        } else {
            toggleButton.textContent = "Enable Dark Mode";
            chrome.storage.local.set({ darkMode: false }); // Save dark mode preference
        }
    }

    // Load dark mode preference on page load
    chrome.storage.local.get("darkMode", (data) => {
        if (data.darkMode) {
            document.body.classList.add("dark-mode");
            document.getElementById("toggleDarkMode").textContent = "Disable Dark Mode";
        }
    });

    // Load the saved links and gamification data when the script runs
    loadLinks();
});
