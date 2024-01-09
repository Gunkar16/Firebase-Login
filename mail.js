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

// initialize firebase
firebase.initializeApp(firebaseConfig);

// reference your database
var contactFormDB = firebase.database().ref("contactForm");

document.getElementById("contactForm").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var emailid = getElementVal("emailid");
  var msgContent = getElementVal("msgContent");

  saveMessages(name, emailid, msgContent);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 3000);

  //   reset the form
  document.getElementById("contactForm").reset();
}

const saveMessages = (name, emailid, msgContent) => {
  var newContactForm = contactFormDB.push();

  newContactForm.set({
    name: name,
    emailid: emailid,
    msgContent: msgContent,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
