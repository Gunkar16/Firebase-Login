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
usersRef.orderByChild('Name').equalTo(userName).once('value')
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
            usersRef.child(userKey).update({
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
function acceptJob(userKey) {
    var usersRef = database.ref('users');
    url = "https://wa.me/"+"61433409278"+"?text=I have accepted the shift";
    window.open(url,"_blank").focus()
    // Update the response and jobEnded keys
    usersRef.child(userKey).update({
        Response: 'Yes',
        JobEnded: 'No'
    });

    // Notify the user that the job has been accepted
    alert('Job accepted successfully.');

    location.reload();

}

// Function to handle declining a job
function declineJob(userKey) {
    var usersRef = database.ref('users');
    url = "https://wa.me/"+"61433409278"+"?text=I have declined the shift";
    window.open(url,"_blank").focus()

    // Update the response key
    usersRef.child(userKey).update({
        Response: 'No'
    });

    // Notify the user that the job has been declined
    alert('Job declined successfully.');

    location.reload();

}

// Function to handle ending a job
function endJob(userKey) {
    var usersRef = database.ref('users');
    url = "https://wa.me/"+"61433409278"+"?text=I have ended the shift";
    window.open(url,"_blank").focus()
    // Retrieve the current value of JobsCompleted
    usersRef.child(userKey).child('JobsCompleted').once('value')
        .then(function (snapshot) {
            // Get the current JobsCompleted value
            var currentJobsCompleted = snapshot.val();

            // Retrieve the current value of StartingTime
            usersRef.child(userKey).child('StartingTime').once('value')
                .then(function (startSnapshot) {
                    // Get the current StartingTime value
                    var startingTime = startSnapshot.val();

                    // Retrieve the current value of EndingTime
                    usersRef.child(userKey).child('EndingTime').once('value')
                        .then(function (endSnapshot) {
                            var endingTime = endSnapshot.val();
                            usersRef.child(userKey).child('TotalWorkingHours').once('value')
                            .then(function (endSnapshot) {
                            var PreviousWorkingHours = endSnapshot.val();
                            console.log(PreviousWorkingHours)
                            let [previousHour, previousMinute] = PreviousWorkingHours.split(':');
                            previous_total_minutes = parseInt(previousHour) * 60 + parseInt(previousMinute)

                            startHour = parseInt(startingTime.slice(0,2))
                            endHour = parseInt(endingTime.slice(0,2))
                            startMinute = parseInt(startingTime.slice(3,5))
                            endMinute = parseInt(endingTime.slice(3,5))

                            console.log(startHour)
                            console.log(endHour)
                            console.log(startMinute)
                            console.log(endMinute)
                            total_minutes_start = startHour * 60 + startMinute
                            total_minutes_end = endHour * 60 + endMinute
                            if (total_minutes_end < total_minutes_start){ 
                                total_minutes_end =  endHour * 60 + endMinute + 24 * 60
                            } 
                            else{
                                total_minutes_end = endHour * 60 + endMinute
                            }
                            finalTime = total_minutes_end - total_minutes_start + previous_total_minutes
                            finalHour = Math.floor(finalTime / 60)
                            finalMinutes = finalTime % 60
                            console.log(finalHour)
                            console.log(finalMinutes)
                            totalWorkingHours = finalHour.toString() + ":" + finalMinutes.toString()
                            console.log('Total Working Hours: ', totalWorkingHours);

                            // Update the jobEnded key to 'Yes' and update JobsCompleted and TotalWorkingHours
                            usersRef.child(userKey).update({
                                JobEnded: 'Yes',
                                JobsCompleted: currentJobsCompleted + 1,
                                TotalWorkingHours: totalWorkingHours
                            });

                            // Notify the user that the job has been ended
                            alert('Job ended successfully.');

                            // Refresh the entire page
                            location.reload();
                        })
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
        usersRef.orderByChild('Name').equalTo(userName).once('value')
            .then(function (snapshot) {
                var jobsExist = false;

                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();

                    // Check if the user has a job assigned and hasn't responded yet
                    if (userData.CurrentJob && userData.Response === 'No response') {
                        // Create a div to display job details
                        var jobDiv = document.createElement('div');
                        jobDiv.classList.add('job-details');

                        // Display job details
                        jobDiv.innerHTML = `
                            <p>Address/Current Job: ${userData.CurrentJob}</p>
                            <p>Date : ${userData.Date}</p>
                            <p>Starting Time: ${userData.StartingTime}</p>
                            <p>Ending Time: ${userData.EndingTime}</p>
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
        usersRef.orderByChild('Name').equalTo(userName).once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();
                    var statusH1 = document.getElementById('Status');
                    // Check if the user has accepted a job
                    if (userData.Response === 'Yes' && userData.JobEnded === 'No') {
                        statusH1.innerHTML = `At ${userData.CurrentJob} from ${userData.StartingTime} to ${userData.EndingTime} on ${userData.Date}
                        <br><button id="end" onclick="endJob('${childSnapshot.key}')" type="submit">End Job</button>`;
                    }
                    else {
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
        usersRef.orderByChild('Name').equalTo(userName).once('value')
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
        // Update the user's password in Firebase Authentication
        user.updatePassword(newPassword)
            .then(function () {
                // Update the user's password in the database
                var userId;
                usersRef.orderByChild('Name').equalTo(userName).once('value')
                    .then(function (snapshot) {
                        snapshot.forEach(function (childSnapshot) {
                            userId = childSnapshot.key;
                        });
                    })
                    .then(function () {
                        if (userId) {
                            // Update the user's password in the database
                            usersRef.child(userId).update({
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
    } else {
        console.error('No authenticated user found.');
    }
});

