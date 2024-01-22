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
// Initialize variables
const auth = firebase.auth()
const database = firebase.database()

// Set up our register function


// Set up our login function
function login() {
    // Get all our input fields
    email = document.getElementById('email').value
    password = document.getElementById('password').value

    // Validate input fields
    if (validate_email(email) == false || validate_password(password) == false) {
        alert('Email or Password is Outta Line!!')
        return
        // Don't continue running the code
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(function () {
            // Declare user variable
            var user = auth.currentUser

            // Retrieve user data from Firebase Database
            var database_ref = database.ref('users/' + user.uid)
            database_ref.once('value')
                .then(function (snapshot) {
                    // Get user data
                    var userData = snapshot.val()
                    console.log(userData.Name)
                    // Store user name in local storage
                    localStorage.setItem('userName', userData.Name)

                    // Update last_sync in Firebase Database    
                    var currentdate = new Date();
                    var datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " @ "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    // Update User data
                    var user_data = {
                        Email: email,
                        LastSync: datetime, 
                        Name: userData.Name // Assuming you have a 'name' field in your user data
                    }

                    // Push to Firebase Database
                    database_ref.update(user_data);

                    // Redirect to page.html
                    alert('User Logged In')
                    window.location.href = "disclaimer.html";
                })
                .catch(function (error) {
                    alert('Error retrieving user data: ' + error.message);
                });

        })
        .catch(function (error) {
            // Firebase will use this to alert of its errors
            var error_code = error.code
            var error_message = error.message
            alert(error_message)
            
        })
}


// Validate Functions
function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
        // Email is good
        return true
    } else {
        // Email is not good
        return false
    }
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    if (password < 6) {
        return false
    } else {
        return true
    }
}

function validate_field(field) {
    if (field == null) {
        return false
    }

    if (field.length <= 0) {
        return false
    } else {
        return true
    }
}
