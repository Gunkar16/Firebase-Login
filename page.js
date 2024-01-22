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


// Reference to the 'users' section in the database
var usersRef = database.ref('users');

// Query the database to find the user key based on the user's name
usersRef.orderByChild('information/Name').equalTo(userName).once('value')
    .then(function(snapshot) {
        if (snapshot.exists()) {
            // Get the user key from the snapshot
            var userKey = Object.keys(snapshot.val())[0];
            
            // Retrieve the current date and time
            var currentdate = new Date();
            var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

            // Update the LastSync key with the current date and time
            usersRef.child(userKey + "/information").update({
                LastSync: datetime
            });

            console.log('LastSync updated successfully.');
        } else {
            console.error('User not found in the database.');
        }
    })
    .catch(function(error) {
        console.error('Error fetching user data: ', error);
    });




// Function to handle accepting a job
function acceptJob(userKey, jobKey) {
    var usersRef = database.ref('users');
    var url = "https://wa.me/" + "61433409278" + "?text=I have accepted the shift for " + jobKey;

    // Open WhatsApp link to notify about accepting the specific job
    window.open(url, "_blank").focus();

    // Construct the path to the specific job's Response and JobEnded keys
    var responsePath = `${userKey}/${jobKey}/Response`;
    var jobEndedPath = `${userKey}/${jobKey}/JobEnded`;

    // Update the response and jobEnded keys for the specific job
    usersRef.child(responsePath).set('Yes');
    usersRef.child(jobEndedPath).set('No')
        .then(function () {
            // Notify the user that the job has been accepted
            alert('Job accepted successfully.');
        })
        .catch(function (error) {
            console.error('Error updating job response and status: ', error);
        });

    location.reload();
}


// Function to handle declining a job
function declineJob(userKey, jobKey) {
    var usersRef = database.ref('users');
    var url = "https://wa.me/" + "61433409278" + "?text=I have declined the shift for " + jobKey;
    
    // Open WhatsApp link to notify about declining the specific job
    window.open(url, "_blank").focus();

    // Construct the path to the specific job's Response key
    var responsePath = `${userKey}/${jobKey}/Response`;

    // Update the response key for the specific job
    usersRef.child(responsePath).set('No')
        .then(function () {
            // Notify the user that the job has been declined
            alert('Job declined successfully.');
        })
        .catch(function (error) {
            console.error('Error updating job response: ', error);
        });

    location.reload();
}

// Function to handle ending a job
function endJob(userKey, jobKey) {
    var usersRef = database.ref('users');
    var jobRef = usersRef.child(userKey).child(jobKey);

    // Open WhatsApp to notify about ending the shift
    var url = "https://wa.me/" + "61433409278" + "?text=I have ended the shift";
    window.open(url, "_blank").focus();

    // Retrieve the current value of JobsCompleted
    usersRef.child(userKey + "/information").child('JobsCompleted').once('value')
        .then(function (snapshot) {
            // Get the current JobsCompleted value
            var currentJobsCompleted = snapshot.val();

            // Retrieve the current value of StartingTime
            jobRef.child('StartingTime').once('value')
                .then(function (startSnapshot) {
                    // Get the current StartingTime value
                    var startingTime = startSnapshot.val();

                    // Retrieve the current value of EndingTime
                    jobRef.child('EndingTime').once('value')
                        .then(function (endSnapshot) {
                            var endingTime = endSnapshot.val();

                            // Retrieve the current value of TotalWorkingHours from the 'information' node
                            usersRef.child(userKey + "/information/TotalWorkingHours").once('value')
                                .then(function (totalHoursSnapshot) {
                                    var previousWorkingHours = totalHoursSnapshot.val();

                                    // Check if TotalWorkingHours is not null before splitting
                                    if (previousWorkingHours !== null) {
                                        // Calculate total working hours
                                        let [previousHour, previousMinute] = previousWorkingHours.split(':');
                                        let previousTotalMinutes = parseInt(previousHour) * 60 + parseInt(previousMinute);

                                        let startHour = parseInt(startingTime.slice(0, 2));
                                        let endHour = parseInt(endingTime.slice(0, 2));
                                        let startMinute = parseInt(startingTime.slice(3, 5));
                                        let endMinute = parseInt(endingTime.slice(3, 5));

                                        let totalMinutesStart = startHour * 60 + startMinute;
                                        let totalMinutesEnd = endHour * 60 + endMinute;

                                        if (totalMinutesEnd < totalMinutesStart) {
                                            totalMinutesEnd = endHour * 60 + endMinute + 24 * 60;
                                        } else {
                                            totalMinutesEnd = endHour * 60 + endMinute;
                                        }

                                        let finalTime = totalMinutesEnd - totalMinutesStart + previousTotalMinutes;
                                        let finalHour = Math.floor(finalTime / 60);
                                        let finalMinutes = finalTime % 60;
                                        let totalWorkingHours = finalHour.toString() + ":" + finalMinutes.toString();

                                        // Update the jobEnded key to 'Yes', JobsCompleted, and TotalWorkingHours
                                        jobRef.update({
                                            JobEnded: 'Yes'
                                        });

                                        usersRef.child(userKey + "/information").update({
                                            JobsCompleted: currentJobsCompleted + 1,
                                            TotalWorkingHours: totalWorkingHours
                                        });

                                        // Notify the user that the job has been ended
                                        alert('Job ended successfully.');

                                        // Refresh the entire page
                                        location.reload();
                                    } else {
                                        console.error('TotalWorkingHours is null');
                                    }
                                })
                                .catch(function (totalHoursError) {
                                    console.error('Error retrieving TotalWorkingHours value:', totalHoursError);
                                });
                        })
                        .catch(function (endError) {
                            console.error('Error retrieving EndingTime value:', endError);
                        });
                })
                .catch(function (startError) {
                    console.error('Error retrieving StartingTime value:', startError);
                });
        })
        .catch(function (error) {
            console.error('Error retrieving JobsCompleted value:', error);
        });
}





document.addEventListener("DOMContentLoaded", function () {
    var currentStatusDiv = document.getElementById("currentStatus");
    var myJobsDiv = document.getElementById("myJobs");
    var informationDiv = document.getElementById("informationSection");
    var userNameInfo = document.getElementById("userNameInfo");
    var userPasswordInfo = document.getElementById("userPasswordInfo");
    var userEmailInfo = document.getElementById("userEmailInfo");

    function showMyJobs() {
        currentStatusDiv.style.display = "none";
        myJobsDiv.style.display = "block";
        informationDiv.style.display = "none";
        myJobsDiv.innerHTML = ''; // Clear previous content
    
        // Reference to the 'users' section in the database
        var usersRef = database.ref('users');
    
        // Find the user with the selected name
        usersRef.orderByChild('information/Name').equalTo(userName).once('value')
            .then(function (snapshot) {
                var jobsExist = false;
    
                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();
    
                    // Check if the user has jobs assigned
                    for (const jobKey in userData) {
                        if (jobKey.startsWith('Job')) {
                            var jobData = userData[jobKey];
    
                            // Check if the user hasn't responded to the job
                            if (jobData.Response === 'No response') {
                                // Create a div to display job details
                                var jobDiv = document.createElement('div');
                                jobDiv.classList.add('job-details');
    
                                // Display job details
                                jobDiv.innerHTML = `
                                    <p>Address: ${jobData.CurrentJob}</p>
                                    <p>Date: ${jobData.Date}</p>
                                    <p>Starting Time: ${jobData.StartingTime}</p>
                                    <p>Ending Time: ${jobData.EndingTime}</p>
                                    <button onclick="acceptJob('${childSnapshot.key}', '${jobKey}')" type="button">Accept</button>
                                    <button onclick="declineJob('${childSnapshot.key}', '${jobKey}')" type="button">Decline</button>
                                `;
    
                                // Append the job details to the myJobsDiv
                                myJobsDiv.appendChild(jobDiv);
    
                                jobsExist = true;
                            }
                        }
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
        usersRef.orderByChild('information/Name').equalTo(userName).once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();
                    var statusH1 = document.getElementById('Status');
                    var otherTitle = document.getElementById("otherTitle")
                    var laterJobsDiv = document.getElementById('laterJobs');
                    var mainJobDisplayed = false;
    
                    // Clear previous content in the laterJobsDiv
                    laterJobsDiv.innerHTML = '';
    
                    for (const jobKey in userData) {
                        if (jobKey.startsWith('Job')) {
                            var jobData = userData[jobKey];
    
                            // Check if the user has a job assigned, hasn't responded, and the job hasn't ended
                            if (jobData.Response === 'Yes' && jobData.JobEnded === 'No' && !mainJobDisplayed) {
                                statusH1.innerHTML = `At ${jobData.CurrentJob} from ${jobData.StartingTime} to ${jobData.EndingTime} on ${jobData.Date}
                                    <br><button id="end" onclick="endJob('${childSnapshot.key}', '${jobKey}')" type="submit">End Job</button>`;
                                mainJobDisplayed = true;
                            } else if (jobData.Response === 'Yes' && jobData.JobEnded === 'No' && mainJobDisplayed) {
                                // Display later jobs under "Later Jobs" without End Job button
                                otherTitle.innerHTML = "Other Jobs:"
                                laterJobsDiv.innerHTML += `At ${jobData.CurrentJob} from ${jobData.StartingTime} to ${jobData.EndingTime} on ${jobData.Date}<br>`;
                            }
                        }
                    }
    
                    if (!mainJobDisplayed) {
                        // Display message if no main job exists
                        statusH1.innerHTML = "None";
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
        usersRef.orderByChild('information/Name').equalTo(userName).once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    userId = childSnapshot.key;
                });
            })
            .then(function () {
                if (userId) {
                    usersRef.child(userId + "/information").once('value')
                        .then(function (snapshot) {
                            const userData = snapshot.val();
                            // Access the password and other fields
                            const password = userData.Password;
                            const email = userData.Email;
                            userPasswordInfo.value = password;
                            userEmailInfo.innerHTML = email;
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

    // Retrieve the current authenticated user
    var user = firebase.auth().currentUser;

    // Check if a user is authenticated
    if (user) {
        // Prompt the user to re-authenticate
        var passwordPrompt = prompt('Please enter your current password to confirm the change.');

        // Create a credential with the user's email and password
        var credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            passwordPrompt
        );

        // Re-authenticate the user with the provided credentials
        user.reauthenticateWithCredential(credential)
            .then(function () {
                // Update the user's password in Firebase Authentication
                user.updatePassword(newPassword)
                    .then(function () {
                        // Update the user's password in the database
                        var userId;
                        usersRef.orderByChild('information/Name').equalTo(userName).once('value')
                            .then(function (snapshot) {
                                snapshot.forEach(function (childSnapshot) {
                                    userId = childSnapshot.key;
                                });
                            })
                            .then(function () {
                                if (userId) {
                                    // Update the user's password in the database
                                    usersRef.child(userId + "/information").update({
                                        Password: newPassword
                                    })
                                        .then(function () {
                                            alert('Password updated successfully.');
                                        })
                                        .catch(function (error) {
                                            console.error('Error updating password in the database: ', error);
                                        });
                                }
                            })
                            .catch(function (error) {
                                console.error('Error retrieving user ID: ', error);
                            });
                    })
                    .catch(function (error) {
                        console.error('Error updating password in Firebase Authentication: ', error);
                    });
            })
            .catch(function (error) {
                console.error('Error re-authenticating user: ', error);
            });
    } else {
        console.error('No authenticated user found.');
    }
});
