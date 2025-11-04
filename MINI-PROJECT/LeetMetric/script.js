document.addEventListener("DOMContentLoaded", function() {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");
    
   
    const profileHeader = document.getElementById("profile-header");
    const usernameDisplay = document.getElementById("username-display");
    const errorMessage = document.getElementById("error-message");

    
    function validateUsername(username) {
        if(username.trim() === "") {
            errorMessage.textContent = "Username should not be empty";
            errorMessage.style.display = "block";
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching) {
            errorMessage.textContent = "Invalid LeetCode username format.";
            errorMessage.style.display = "block";
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {

        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
          
            errorMessage.style.display = "none";
            profileHeader.style.display = "none";
            cardStatsContainer.innerHTML = ""; 

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
            const targetUrl = 'https://leetcode.com/graphql/';
            
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            
            if(!response.ok) {
               
                throw new Error(`Network response was not ok (Status: ${response.status})`);
            }
            
            const parsedData = await response.json();

          
            if(parsedData.errors) {
                 throw new Error(parsedData.errors[0].message);
            }
            if(!parsedData.data.matchedUser) {
                throw new Error("User not found. Please check the username.");
            }

            console.log("Logging data: ", parsedData) ;

            
            displayUserData(parsedData, username);
        }
        catch(error) {
            
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.style.display = "block";
            
            updateProgress(0, 0, easyLabel, easyProgressCircle);
            updateProgress(0, 0, mediumLabel, mediumProgressCircle);
            updateProgress(0, 0, hardLabel, hardProgressCircle);
        }
        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
   
        const progressDegree = (total > 0) ? (solved / total) * 100 : 0;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }


    function displayUserData(parsedData, username) {
 
        usernameDisplay.textContent = username;
        profileHeader.style.display = "block";

    
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        
        const cardsData = [
            {label: "Overall Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions, class: "card-overall" },
            {label: "Easy Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions, class: "card-easy" },
            {label: "Medium Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions, class: "card-medium" },
            {label: "Hard Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions, class: "card-hard" },
        ];

        console.log("card ka data: " , cardsData);

        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                
                `<div class="card ${data.class}">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div>`
        ).join("")
    }

    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        errorMessage.style.display = "none";
        if(validateUsername(username)) {
            fetchUserDetails(username);
        }
    })
});