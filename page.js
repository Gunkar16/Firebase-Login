userName = localStorage.getItem("userName");
document.getElementById("welcomeName").innerHTML = userName;

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1qfrpttkA2a4Ww6JI627U9qmi2-Q87FY",
    authDomain: "trial-project-20b4c.firebaseapp.com",
    databaseURL: "https://trial-project-20b4c-default-rtdb.firebaseio.com",
    projectId: "trial-project-20b4c",
    storageBucket: "trial-project-20b4c.appspot.com",
    messagingSenderId: "458445394475",
    appId: "1:458445394475:web:29eeaac17bb48c3b43d06e",
    measurementId: "G-01BQMPN3PN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const usersRef = database.ref('users'); // Define usersRef here

// Function to handle accepting a job
function acceptJob(userKey) {
    var usersRef = database.ref('users');

    // Update the response and jobEnded keys
    usersRef.child(userKey).update({
        response: 'yes',
        jobEnded: 'No'
    });

    // Notify the user that the job has been accepted
    alert('Job accepted successfully.');

    location.reload();

}

// Function to handle declining a job
function declineJob(userKey) {
    var usersRef = database.ref('users');

    // Update the response key
    usersRef.child(userKey).update({
        response: 'no'
    });

    // Notify the user that the job has been declined
    alert('Job declined successfully.');

    location.reload();

}

// Function to handle ending a job
function endJob(userKey) {
    var usersRef = database.ref('users');

    // Update the jobEnded key to 'Yes'
    usersRef.child(userKey).update({
        jobEnded: 'Yes'
    });

    // Notify the user that the job has been ended
    alert('Job ended successfully.');

    // Refresh the entire page
    location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
    var currentStatusDiv = document.getElementById("currentStatus");
    var myJobsDiv = document.getElementById("myJobs");
    var informationDiv = document.getElementById("informationSection");
    var userNameInfo = document.getElementById("userNameInfo");
    var userPasswordInfo = document.getElementById("userPasswordInfo");

    function showMyJobs() {
        currentStatusDiv.style.display = "none";
        myJobsDiv.style.display = "block";
        informationDiv.style.display = "none";
        myJobsDiv.innerHTML = ''; // Clear previous content

        // Reference to the 'users' section in the database
        var usersRef = database.ref('users');

        // Find the user with the selected name
        usersRef.orderByChild('name').equalTo(userName).once('value')
            .then(function (snapshot) {
                var jobsExist = false;

                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();

                    // Check if the user has a job assigned and hasn't responded yet
                    if (userData.currentJob && userData.response === 'no response') {
                        // Create a div to display job details
                        var jobDiv = document.createElement('div');
                        jobDiv.classList.add('job-details');

                        // Display job details
                        jobDiv.innerHTML = `
                            <p>Address/Current Job: ${userData.currentJob}</p>
                            <p>Date : ${userData.date}</p>
                            <p>Starting Time: ${userData.startingTime}</p>
                            <p>Ending Time: ${userData.endingTime}</p>
                            <button onclick="acceptJob('${childSnapshot.key}')" type="button">Accept</button>
                            <button onclick="declineJob('${childSnapshot.key}')" type="button">Decline</button>
                        `;

                        // Append the job details to the myJobsDiv
                        myJobsDiv.appendChild(jobDiv);

                        jobsExist = true;
                    }
                });

                // Display message if no jobs exist
                if (!jobsExist) {
                    var noJobsMessage = document.createElement('p');
                    noJobsMessage.setAttribute("id", "noJob");
                    noJobsMessage.innerHTML = 'No further jobs.';
                    myJobsDiv.appendChild(noJobsMessage);
                }
            })
            .catch(function (error) {
                console.error('Error fetching user details: ', error);
            });
    }

    // Function to update the current job status in the Current Status section
    function updateCurrentStatus() {
        // Reference to the 'users' section in the database
        var usersRef = database.ref('users');

        // Find the user with the selected name
        usersRef.orderByChild('name').equalTo(userName).once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();

                    // Check if the user has accepted a job
                    if (userData.response === 'yes' && userData.jobEnded === 'No') {
                        var statusH1 = document.getElementById('Status');
                        statusH1.innerHTML = `At ${userData.currentJob} from ${userData.startingTime} to ${userData.endingTime} on ${userData.date}
                        <br><button id="end" onclick="endJob('${childSnapshot.key}')" type="submit">End Job</button>`;
                    }
                });
            })
            .catch(function (error) {
                console.error('Error updating current status: ', error);
            });
    }

    function showInformation() {
        currentStatusDiv.style.display = "none";
        myJobsDiv.style.display = "none";
        informationDiv.style.display = "flex";

        // Display user information
        userNameInfo.innerText = userName;

        // Retrieve the user's password from the database and display it
        var userId;
        usersRef.orderByChild('name').equalTo(userName).once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    userId = childSnapshot.key;
                });
            })
            .then(function () {
                if (userId) {
                    usersRef.child(userId).once('value')
                        .then(function (snapshot) {
                            const userData = snapshot.val();
                            // Access the password and other fields
                            const password = userData.password;
                            userPasswordInfo.value = password;
                        })
                        .catch(function (error) {
                            console.error('Error retrieving user information: ', error);
                        });
                }
            })
            .catch(function (error) {
                console.error('Error retrieving user ID: ', error);
            });
    }

    document.getElementById("myJobsButton").addEventListener("click", showMyJobs);

    document.getElementById("informationButton").addEventListener("click", showInformation);

    document.getElementById("currentStatusButton").addEventListener("click", function () {
        currentStatusDiv.style.display = "flex";
        myJobsDiv.style.display = "none";
        informationDiv.style.display = "none";
        
        // Update the current job status in the Current Status section
        updateCurrentStatus();
    
    });
    

    updateCurrentStatus();
});

let checkbox = document.getElementById("checkbox");
let passwordText = document.getElementById("userPasswordInfo");
checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        passwordText.setAttribute("type", "text");
    } else {
        passwordText.setAttribute("type", "password");
    }
});

document.getElementById("confirmPasswordButton").addEventListener("click", function () {
    // Retrieve the new password from the input field
    var newPassword = userPasswordInfo.value;

    // Verify that the password is longer than 6 characters
    if (newPassword.length <= 6) {
        alert('Password must be longer than 6 characters.');
        return;
    }

    // Retrieve the user's ID
    var userId;
    usersRef.orderByChild('name').equalTo(userName).once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                userId = childSnapshot.key;
            });
        })
        .then(function () {
            if (userId) {
                // Update the user's password in the database
                usersRef.child(userId).update({
                    password: newPassword
                })
                .then(function () {
                    alert('Password updated successfully.');
                })
                .catch(function (error) {
                    console.error('Error updating password: ', error);
                });
            }
        })
        .catch(function (error) {
            console.error('Error retrieving user ID: ', error);
        });
});

