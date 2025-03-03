function showLogoutModal(event) {
    event.preventDefault();
    document.getElementById("logoutModal").style.display = "block";
}

function closeModal() {
    document.getElementById("logoutModal").style.display = "none";
}

function confirmLogout() {
    logout();
    window.location.href = "login.html"
}

// Function to toggle the sidebar visibility
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active'); // Toggle the 'active' class to show/hide the sidebar
}

// Viewing customer accounts that is archived
function showArchivedAccounts() {
    window.location.href = "archivedCustomer.html";
}

// Viewing active customer accounts
function showActiveAccounts() {
    window.location.href = "customer.html";
}

// Viewing active customer accounts
function showDriverActiveAccounts() {
    window.location.href = "employee.html";
}

function showArchivedDriverAccounts() {
    window.location.href = 'archivedDriver.html';
}




// Function for Driver -----------------------------------------------------

// Function to add driver
function showAddDriverModal(event) {
    event.preventDefault();
    document.getElementById("add-driver-modal").style.display = "block";

    const form = document.getElementById("addDriver-form");
    const clone = form.cloneNode(true);
    form.replaceWith(clone);

    clone.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Retrieve values from the form
        const fname = document.getElementById("fname").value;
        const lname = document.getElementById("lname").value;
        const email = document.getElementById("email").value;
        const bodyNum = document.getElementById("bodyNum").value;
        const contactNum = document.getElementById("contactNum").value;
        const plateNum = document.getElementById("plateNum").value;
        const password = document.getElementById("password").value;

        // Retrieve files
        const driverImage = document.getElementById("driverImage").files[0];
        const corFile = document.getElementById("corFile").files[0];
        const referenceLetter = document.getElementById("referenceLetter").files[0];
        const barangayClearance = document.getElementById("barangayClearance").files[0];
        const insurance = document.getElementById("insurance").files[0];
        const idPicture = document.getElementById("idPicture").files[0];
        const tricyclePicture = document.getElementById("tricyclePicture").files[0];

        if (fname && lname && email && bodyNum && contactNum && plateNum && password &&
            driverImage && corFile && referenceLetter && barangayClearance && insurance && idPicture && tricyclePicture) {
            try {
                const imageUrl = await uploadDriverImage(driverImage, email);
                const corUrl = await uploadDriverImage(corFile, email);
                const referenceUrl = await uploadDriverImage(referenceLetter, email);
                const barangayUrl = await uploadDriverImage(barangayClearance, email);
                const insuranceUrl = await uploadDriverImage(insurance, email);
                const idUrl = await uploadDriverImage(idPicture, email);
                const tricycleUrl = await uploadDriverImage(tricyclePicture, email);

                await addDriverData(fname, lname, email, bodyNum, contactNum, plateNum, password, imageUrl, corUrl, referenceUrl, barangayUrl, insuranceUrl, idUrl, tricycleUrl);
                clone.reset();
                closeAddDriverModal();
            } catch (error) {
                alert("Error uploading files: " + error.message, "warning");
            }
        } else {
            alert("Please fill out all the fields and upload all required documents.", "warning");
        }
    });
}

// Function to upload documents
async function uploadDriverImage(imageFile, email) {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`driver_documents/${email}_${imageFile.name}`);
    await imageRef.put(imageFile);
    return await imageRef.getDownloadURL();
}


function closeAddDriverModal() {
    document.getElementById("add-driver-modal").style.display = "none";
}

// Functions for Routes --------------------------------------------------------------

//Function to add routes
function showAddRouteModal(event) {
    event.preventDefault();
    document.getElementById("add-route-modal").style.display = "block";

    const form = document.getElementById("addRoute-form");
    const clone = form.cloneNode(true);
    form.replaceWith(clone);

    clone.addEventListener("submit", (event) => {
        event.preventDefault();

        const origin = document.getElementById("origin").value;
        const destination = document.getElementById("destination").value;
        const distance = document.getElementById("distance").value;
        const fare = document.getElementById("fare").value;
        const service = document.getElementById("service").value;
        
        if (origin && destination && distance && fare && service) {
            addRouteData(origin, destination, distance, fare, service);

            // Reset the form details
            clone.reset();

            // Close the modal
            closeAddRouteModal();
        } else {
            alert("Please fill out all the fields", "warning");
        }
    });
}

function closeAddRouteModal() {
    document.getElementById("add-route-modal").style.display = "none";
}

// FIREBASE ------------------------------------------------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyDCHOgg4l6CZ5_sG2EYREf0Mm3bM6TQciI",
    authDomain: "pasada-97a81.firebaseapp.com",
    databaseURL: "https://pasada-97a81-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectID: "pasada-97a81",
    storageBucket: "pasada-97a81.firebasestorage.app",
    messagingSenderID: "1079229233539",
    appID: "1:1079229233539:web:08c8785e4e62eaf742deb6"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();


// FOR SORTING EMPLOYEES INFORMATION -----------------------------------------------------

let allEmployees = []; // To store all employees for filtering

function retrieveEmployeeData() {
    const tableBody = document.querySelector('#driverList');

    database.ref('Employee').on('value', function (snapshot) {
        if (snapshot.exists()) {
            // Retrieve employees and filter only non-archived ones
            allEmployees = Object.entries(snapshot.val()) // Update allEmployees
                .map(([key, employee]) => ({ key, ...employee }))
                .filter(emp => emp.isArchived === false || emp.isArchived === "false")
                .sort((a, b) => parseInt(a.driverID, 10) - parseInt(b.driverID, 10)); // Sort by driverID

            renderEmployeeTable(allEmployees);
        } else {
            tableBody.innerHTML = '<tr><td colspan="7">No Employees found</td></tr>';
        }
    }, function (error) {
        console.error("Error retrieving data:", error);
        tableBody.innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
    });
}

function renderEmployeeTable(employees) {
    const tableBody = document.querySelector('#driverList');
    tableBody.innerHTML = '';

    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No matching employees found</td></tr>';
        return;
    }

    employees.forEach(({ key, driverID, fname, lname, email, plateNum, contactNum, bodyNum, status, lastOffline }) => {
        const row = document.createElement('tr');

        // Determine status text and color
        let statusText = "Active";
        let statusClass = "active";
        let lastSeenText = "";

        if (status === "offline") {
            statusText = "Offline";
            statusClass = "offline";
            lastSeenText = lastOffline ? ` (Last seen: ${formatTimestamp(lastOffline)})` : "";
        }

        row.innerHTML = `
            <td>${driverID}</td>
            <td>${fname} ${lname}</td>
            <td>${email}</td>
            <td>${contactNum}</td>
            <td>${bodyNum}</td>
            <td>${plateNum}</td>
            <td>
                <span class="status-circle ${statusClass}"></span> ${statusText} ${lastSeenText}
            </td>
            <td>
                <button onclick="showEditDriverModal(event, '${key}')">Edit</button>
                <button onclick="toggleArchiveEmployee('${key}')">Archive</button>
                <button onclick="deleteDriverData('${key}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Helper function to format timestamps
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Converts to readable date-time format
}


function filterEmployeeData() {
    const filterInput = document.querySelector('#filterInput').value.toLowerCase();

    const filteredEmployees = allEmployees.filter(({ fname, lname, email, bodyNum, contactNum, plateNum}) => {
        const fullName = `${fname} ${lname}`.toLowerCase();

        // Ensure bodyNum and plateNum are treated as strings before calling toLowerCase
        const bodyNumStr = bodyNum.toString().toLowerCase();
        const plateNumStr = plateNum.toString().toLowerCase();

        return (
            fullName.includes(filterInput) ||
            email.toLowerCase().includes(filterInput) ||
            bodyNumStr.includes(filterInput) || // Works with bodyNum as string
            contactNum.toLowerCase().includes(filterInput) ||
            plateNumStr.toLowerCase().includes(filterInput)
        );
    });

    renderEmployeeTable(filteredEmployees);
}

async function toggleArchiveEmployee(key) {
    const confirmAction = await b_confirm("Are you sure you want to archive/unarchive this driver?");

    if (!confirmAction) return;

    const employeeRef = firebase.database().ref('Employee/' + key);

    employeeRef.once('value').then((snapshot) => {
        const employeeData = snapshot.val();

        if (employeeData) {
            const currentArchiveStatus = employeeData.isArchived;
            const newArchiveStatus = currentArchiveStatus === "true" ? "false" : "true";

            employeeRef.update({ isArchived: newArchiveStatus })
            .then(() => {
                console.log(`User ${key} archive status updated to ${newArchiveStatus}`);

                updateEmployeeTableRow(key, newArchiveStatus);
            })
            .catch((error) => console.error("Error updating user: ", error));
        } else {
            console.error("No such user!");
        }
    })
    .catch((error) => console.error("Error getting user data:", error));
}

// 🔽 Function to show the modal and return user choice
async function b_confirm(msg) {
    return new Promise((resolve) => {
        const modalElem = document.createElement('div');
        modalElem.className = "modal fade";
        modalElem.id = "modal-confirm";
        modalElem.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body">
                        <p>${msg}</p>
                    </div>
                    <div class="modal-footer">
                        <button id="modal-btn-cancel" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button id="modal-btn-confirm" type="button" class="btn btn-primary">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalElem);
        const myModal = new bootstrap.Modal(modalElem, { keyboard: false, backdrop: 'static' });
        myModal.show();

        document.getElementById('modal-btn-cancel').addEventListener('click', () => {
            myModal.hide();
            modalElem.remove();
            resolve(false);
        });

        document.getElementById('modal-btn-confirm').addEventListener('click', () => {
            myModal.hide();
            modalElem.remove();
            resolve(true);
        });
    });
}


// Function to update the specific row in the table
function updateEmployeeTableRow(key, newArchiveStatus) {
    const row = document.getElementById(key); // Get the row by its ID
    if (row) {
        // Find the Archive/Unarchive button in the row
        const archiveButton = row.querySelector('button[onclick^="toggleArchiveEmployee"]');
        
        // Update the button text based on the new archive status
        if (archiveButton) {
            archiveButton.textContent = newArchiveStatus === "true" ? 'Unarchive' : 'Archive';
        }
    }
}

// Function to show the edit modal and populate it with driver data
function showEditDriverModal(event, key) {
    event.preventDefault();
    const driver = allEmployees.find(driver => driver.key === key);
    if (driver) {
        document.getElementById('edit-key').value = driver.key;
        document.getElementById('edit-fname').value = driver.fname;
        document.getElementById('edit-lname').value = driver.lname;
        document.getElementById('edit-email').value = driver.email;
        document.getElementById('edit-contactNum').value = driver.contactNum;
        document.getElementById('edit-bodyNum').value = driver.bodyNum;
        document.getElementById('edit-plateNum').value = driver.plateNum;

        // Display the edit modal
        document.getElementById('edit-driver-modal').style.display = 'block';
    }
    
    openEditDriverModal();
}

document.addEventListener('DOMContentLoaded', function () {
    // Attach the submit event listener to the edit form
    const editForm = document.getElementById('editDriver-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditDriverFormSubmit);
    }

    // Fetch initial data
    retrieveEmployeeData();
});

function handleEditDriverFormSubmit(event) {
    event.preventDefault();

    try {
        const key = document.getElementById('edit-key').value;
        const fname = document.getElementById('edit-fname').value;
        const lname = document.getElementById('edit-lname').value;
        const email = document.getElementById('edit-email').value;
        const contactNum = document.getElementById('edit-contactNum').value;
        const bodyNum = document.getElementById('edit-bodyNum').value;
        const plateNum = document.getElementById('edit-plateNum').value;

        // File inputs
        const driverImage = document.getElementById('edit-driverImage').files[0];
        const corFile = document.getElementById('edit-corFile').files[0];
        const referenceLetter = document.getElementById('edit-referenceLetter').files[0];
        const barangayClearance = document.getElementById('edit-barangayClearance').files[0];
        const insurance = document.getElementById('edit-insurance').files[0];
        const idPicture = document.getElementById('edit-idPicture').files[0];
        const tricyclePicture = document.getElementById('edit-tricyclePicture').files[0];

        // Show loading message
        document.getElementById('loadingMessage').style.display = 'block';

        // Create an object with only modified fields
        let updates = {};
        if (fname) updates.fname = fname;
        if (lname) updates.lname = lname;
        if (email) updates.email = email;
        if (contactNum) updates.contactNum = contactNum;
        if (bodyNum) updates.bodyNum = bodyNum;
        if (plateNum) updates.plateNum = plateNum;

        // Check if there are updates
        if (Object.keys(updates).length === 0 && !driverImage && !corFile && !referenceLetter && !barangayClearance && !insurance && !idPicture && !tricyclePicture) {
            alert("No changes were made.");
            document.getElementById('loadingMessage').style.display = 'none';
            return;
        }

        const storageRef = firebase.storage().ref();
        const filePromises = [];

        const uploadFile = (file, path) => {
            const fileRef = storageRef.child(path);
            return fileRef.put(file).then(snapshot => snapshot.ref.getDownloadURL());
        };

        if (driverImage) filePromises.push(uploadFile(driverImage, `drivers/${key}/driverImage.jpg`).then(url => updates.driverImage = url));
        if (corFile) filePromises.push(uploadFile(corFile, `drivers/${key}/corFile.pdf`).then(url => updates.corFile = url));
        if (referenceLetter) filePromises.push(uploadFile(referenceLetter, `drivers/${key}/referenceLetter.pdf`).then(url => updates.referenceLetter = url));
        if (barangayClearance) filePromises.push(uploadFile(barangayClearance, `drivers/${key}/barangayClearance.pdf`).then(url => updates.barangayClearance = url));
        if (insurance) filePromises.push(uploadFile(insurance, `drivers/${key}/insurance.pdf`).then(url => updates.insurance = url));
        if (idPicture) filePromises.push(uploadFile(idPicture, `drivers/${key}/idPicture.jpg`).then(url => updates.idPicture = url));
        if (tricyclePicture) filePromises.push(uploadFile(tricyclePicture, `drivers/${key}/tricyclePicture.jpg`).then(url => updates.tricyclePicture = url));

        // Wait for all file uploads, then update database
        Promise.all(filePromises)
            .then(() => {
                if (Object.keys(updates).length > 0) {
                    return database.ref('Employee/' + key).update(updates);
                }
            })
            .then(() => {
                showAlert("Driver information updated successfully!", "success");
                closeEditDriverModal();
                retrieveEmployeeData();
            })
            .catch(error => {
                console.error("Error during update:", error);
                alert("Some updates have no changes, but other changes were saved.");
            })
            .finally(() => {
                document.getElementById('loadingMessage').style.display = 'none';
            });

    } catch (error) {
        console.error("Error in handleEditDriverFormSubmit:", error);
        alert("An error occurred. Please check the console for details.");
        document.getElementById('loadingMessage').style.display = 'none';
    }
}


function closeEditEmployeeModal() {
    document.getElementById('edit-driver-modal').style.display = 'none';
}

function handleEditEmployeeFormSubmit(event) {
    event.preventDefault();

    try {
        const key = document.getElementById('edit-key').value;
        const fname = document.getElementById('edit-fname').value;
        const lname = document.getElementById('edit-lname').value;
        const email = document.getElementById('edit-email').value;
        const contactNum = document.getElementById('edit-contactNum').value;
        const bodyNum = document.getElementById('edit-bodyNum').value;
        const plateNum = document.getElementById('edit-plateNum').value;

        // Reference to file inputs
        const fileInputs = document.querySelectorAll('#editDriver-form input[type="file"]');

        // Create an object with only the modified fields
        const updatedData = {};
        if (fname) updatedData.fname = fname;
        if (lname) updatedData.lname = lname;
        if (email) updatedData.email = email;
        if (contactNum) updatedData.contactNum = contactNum;
        if (bodyNum) updatedData.bodyNum = bodyNum;
        if (plateNum) updatedData.plateNum = plateNum;

        // Check if there is something to update
        if (Object.keys(updatedData).length === 0) {
            alert('No changes were made.');
            return;
        }

        // Update the driver information in Firebase
        database.ref('Employee/' + key).update(updatedData)
            .then(() => {
                showAlert('Driver information updated successfully!', "success");

                // Clear the file input fields manually
                fileInputs.forEach(input => input.value = '');

                closeEditEmployeeModal();
                retrieveEmployeeData(); // Refresh the driver list
            })
            .catch((error) => {
                console.error('Error updating driver:', error);
                showAlert('Some updates failed, but at least one change was saved.', "warning");
            });

    } catch (error) {
        console.error('Error in handleEditEmployeeFormSubmit:', error);
        showAlert('An error occurred. Please check the console for details.', "warning");
    }
}



function openEditDriverModal() {
    // Reset file input fields
    const fileInputs = document.querySelectorAll('#editDriver-form input[type="file"]');
    fileInputs.forEach(input => input.value = '');

    // Show the edit modal
    document.getElementById('edit-driver-modal').style.display = 'block';
}


function resetPassword() {
    const email = document.getElementById('edit-email').value;

    if (!email) {
        alert('Please enter an email address.');
        return;
    }

    // Send a password reset email to the user
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert('Password reset email sent successfully!');
        })
        .catch((error) => {
            console.error('Error sending password reset email:', error);
            alert('Failed to send password reset email. Please try again.');
        });
}

let archivedEmployees = [];

function retrieveArchivedEmployees() {
    const tableBody = document.querySelector('#archivedList');

    database.ref('Employee').on('value', function (snapshot) {
        if (snapshot.exists()) {
            // Filter only archived employees
            archivedEmployees = Object.entries(snapshot.val()).map(([key, employee]) => ({
                key,
                ...employee,
            })).filter(emp => emp.isArchived === "true");

            renderArchivedEmployeeTable(archivedEmployees);
        } else {
            tableBody.innerHTML = '<tr><td colspan="7">No Archived Employees found</td></tr>';
        }
    }, function (error) {
        console.error("Error retrieving archived data:", error);
        tableBody.innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
    });
}

function renderArchivedEmployeeTable(employees) {
    const tableBody = document.querySelector('#archivedList');
    tableBody.innerHTML = '';

    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No archived employees found</td></tr>';
        return;
    }

    employees.forEach(({ key, driverID, fname, lname, email, plateNum, contactNum, bodyNum }) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${driverID}</td>
            <td>${fname} ${lname}</td>
            <td>${email}</td>
            <td>${contactNum}</td>
            <td>${bodyNum}</td>
            <td>${plateNum}</td>
            <td>
                <button onclick="toggleArchiveEmployee('${key}')">restore</button>
                <button onclick="deleteArchivedDriverData('${key}')">Delete</button>
            </td>
            
        `;

        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', retrieveArchivedEmployees);

function filterArchivedEmployeeData() {
    const filterInput = document.querySelector('#archivedFilterInput').value.toLowerCase();

    const confirmAction = confirm("Are you sure you want to archive/unarchive this customer?");
    
    if (!confirmAction) {
        return; // Exit the function if user cancels
    }

    const filteredArchivedEmployees = archivedEmployees.filter(({ fname, lname, email, bodyNum, contactNum, plateNum }) => {
        const fullName = `${fname} ${lname}`.toLowerCase();
        const bodyNumStr = bodyNum.toString().toLowerCase();
        const plateNumStr = plateNum.toString().toLowerCase();
        const contactNumStr = contactNum.toString().toLowerCase(); // Convert to string to avoid errors

        return (
            fullName.includes(filterInput) ||
            email.toLowerCase().includes(filterInput) ||
            bodyNumStr.includes(filterInput) ||
            contactNumStr.includes(filterInput) ||
            plateNumStr.includes(filterInput)
        );
    });

    renderArchivedEmployeeTable(filteredArchivedEmployees);
}


// FOR SORTING THE CUSTOMERS ACCOUNT ------------------------------------------------------------------

let allCustomers = []; // To store all customers for filtering

function retrieveCustomerData() {
    const tableBody = document.querySelector('#customerList');
    
    // Listen for real-time changes in the User node
    database.ref('User').on('value', function(snapshot) {
        if (snapshot.exists()) {
            const users = snapshot.val();
            console.log("All users:", users); // Log all users

            allCustomers = Object.entries(users)
                .filter(([key, user]) => {
                    console.log(`User ${key}: isArchived = ${user.isArchived}`); // Log each user's isArchived value
                    return user.isArchived === "false" || user.isArchived === false; // Flexible condition
                })
                .map(([key, user]) => ({
                    key,
                    ...user,
                }));

            console.log("Filtered customers:", allCustomers); // Log filtered customers

            if (allCustomers.length > 0) {
                renderCustomerTable(allCustomers);
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">No Active Users found</td></tr>';
            }
        } else {
            tableBody.innerHTML = '<tr><td colspan="4">No Users found</td></tr>';
        }
    }, function(error) {
        console.error("Error retrieving data:", error);
        tableBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
    });
}

let archivedCustomers = []; // To store archived customers for filtering

function retrieveArchivedCustomerData() {
    const tableBody = document.querySelector('#customerList');
    
    // Listen for real-time changes in the User node
    database.ref('User').on('value', function(snapshot) {
        if (snapshot.exists()) {
            const users = snapshot.val();
            console.log("All users:", users); // Log all users

            archivedCustomers = Object.entries(users)
                .filter(([key, user]) => {
                    console.log(`User ${key}: isArchived = ${user.isArchived}`); // Log each user's isArchived value
                    return user.isArchived === "true" || user.isArchived === true; // Flexible condition
                })
                .map(([key, user]) => ({
                    key,
                    ...user,
                }));

            console.log("Filtered archived customers:", archivedCustomers); // Log filtered archived customers

            if (archivedCustomers.length > 0) {
                renderCustomerTable(archivedCustomers);
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">No Archived Users found</td></tr>';
            }
        } else {
            tableBody.innerHTML = '<tr><td colspan="4">No Users found</td></tr>';
        }
    }, function(error) {
        console.error("Error retrieving data:", error);
        tableBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
    });
}

function filterArchivedCustomerData() {
    const filterInput = document.querySelector('#archivedFilterInput').value.toLowerCase();
    
    const filteredArchivedCustomers = archivedCustomers.filter(({ firstName, lastName, email, phoneNumber }) => {
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        return (
            fullName.includes(filterInput) ||
            email.toLowerCase().includes(filterInput) ||
            phoneNumber.toLowerCase().includes(filterInput)
        );
    });

    renderCustomerTable(filteredArchivedCustomers);
}


function renderCustomerTable(customers) {
    const tableBody = document.querySelector('#customerList');
    tableBody.innerHTML = '';

    if (customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No matching users found</td></tr>';
        return;
    }

    customers.forEach(({ key, firstName, lastName, email, phoneNumber, isArchived }) => {
        const row = document.createElement('tr');
        row.id = key;

        row.innerHTML = `
            <td>${firstName} ${lastName}</td>
            <td>${email}</td>
            <td>${phoneNumber}</td>
            <td>
                <button onclick="toggleArchiveCustomer('${key}')">
                    ${isArchived === "true" ? 'Restore' : 'Archive'}
                </button>
                <button onclick="deleteCustomerData('${key}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function filterCustomerData() {
    const filterInput = document.querySelector('#filterInput').value.toLowerCase();

    const filteredCustomers = allCustomers.filter(({ firstName, lastName, email, phoneNumber }) => {
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        return (
            fullName.includes(filterInput) ||
            email.toLowerCase().includes(filterInput) ||
            phoneNumber.toLowerCase().includes(filterInput)
        );
    });

    renderCustomerTable(filteredCustomers);
}


/* 
    FUNCTION TO ARCHIVE CUSTOMERS ACCOUNT
*/
async function toggleArchiveCustomer(key) {
    // Show confirmation dialog
    const confirmAction = await b_confirm("Are you sure you want to archive/unarchive this customer?");
    
    if (!confirmAction) {
        return; // Exit the function if user cancels
    }

    // Reference to the specific user in the Firebase Realtime Database
    const userRef = firebase.database().ref('User/' + key);

    // Get the current data of the user
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val();

        if (userData) {
            const currentArchiveStatus = userData.isArchived;

            // Toggle the archive status
            const newArchiveStatus = currentArchiveStatus === "true" ? "false" : "true";

            // Update the user's archive status in the database
            userRef.update({
                isArchived: newArchiveStatus
            })
            .then(() => {
                console.log(`User ${key} archive status updated to ${newArchiveStatus}`);
                
                // Refresh the table or update the specific row
                updateTableRow(key, newArchiveStatus);
            })
            .catch((error) => {
                console.error("Error updating user: ", error);
            });
        } else {
            console.error("No such user!");
        }
    })
    .catch((error) => {
        console.error("Error getting user data:", error);
    });
}



// Function to update the specific row in the table
function updateTableRow(key, newArchiveStatus) {
    const row = document.getElementById(key); // Get the row by its ID
    if (row) {
        // Find the Archive/Unarchive button in the row
        const archiveButton = row.querySelector('button[onclick^="toggleArchiveCustomer"]');
        
        // Update the button text based on the new archive status
        if (archiveButton) {
            archiveButton.textContent = newArchiveStatus === "true" ? 'Unarchive' : 'Archive';
        }
    }
}

// Retrieving data for card in dashbaord
function renderRecentUser(users) {
    const recentUsersList = document.querySelector('#recentUsers');
    recentUsersList.innerHTML = ''; // Clear previous content

    if (users.length === 0) {
        recentUsersList.innerHTML = '<tr><td colspan="3">No recent users available</td></tr>';
        return;
    }

    // Get the last 3 completed transactions
    const recentUsers = users.slice(-3).reverse();

    recentUsers.forEach(({ key, firstName, lastName, email, phoneNumber }) => {
        const row = document.createElement('tr');
        row.id = key;

        row.innerHTML = `
            <td>${firstName} ${lastName}</td>
            <td>${email}</td>
            <td>${phoneNumber}</td>
        `;

        recentUsersList.appendChild(row);
    });
}

// Fetch data and update recent transactions
database.ref('User').on('value', function (snapshot) {
    if (snapshot.exists()) {
        let users = Object.entries(snapshot.val()).map(([key, user]) => ({
            key,
            ...user
        }));

        renderRecentUser(users);
    } else {
        document.querySelector('#recentUsers').innerHTML = '<tr><td colspan="3">No Users found</td></tr>';
    }
}, function (error) {
    console.error("Error retrieving users:", error);
    document.querySelector('#recentUsers').innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
});

// FUNCTION FOR SEARCHING SPECIFIC DETAILS IN HISTORY SECTION --------------------------------------------------


// function for retrieving the complete transaction
let allOrders = []; // Store all orders for filtering

// Function to retrieve the complete transaction
function retrieveHistory() {
    const tableBody = document.querySelector('#historyList');

    database.ref('Order').once('value', function(snapshot) {
        if (snapshot.exists()) {
            allOrders = []; // Reset allOrders before processing

            const orders = snapshot.val();

            tableBody.innerHTML = '';

            Object.keys(orders).forEach(function(key) {
                const order = orders[key];

                // Only process the order if its status is "Completed"
                if (order.status === "Completed") {
                    // Fetch the customer's name using the customerUID from the User node
                    database.ref('User/' + order.customerUID).once('value', function(customerSnapshot) {
                        if (customerSnapshot.exists()) {
                            const customerData = customerSnapshot.val();
                            const customerName = `${customerData.firstName} ${customerData.lastName}` || "Unknown Customer";
                            // Check if textReview exists; if not, default to "No review"
                            const textReview = order.textReview && order.textReview.trim() ? order.textReview : "No review";

                            // Store the order in allOrders
                            allOrders.push({ key, ...order, customerName, textReview });

                            // Render the table with all orders initially
                            renderHistoryTable(allOrders);
                        }
                    }, function(error) {
                        console.error("Error fetching customer info:", error);
                    });
                }
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="6">No Completed Orders found</td></tr>';
        }
    }, function(error) {
        console.error("Error retrieving data:", error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
    });
}

// Function to render orders to the table
function renderHistoryTable(orders) {
    const tableBody = document.querySelector('#historyList');
    tableBody.innerHTML = '';

    // Update total history count
    document.querySelector('.transaction-count').textContent = orders.length;

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No matching orders found</td></tr>';
        return;
    }

    orders.forEach(({ key, driverFirstName, driverLastName, customerName, service, origin, destination, fare, completionTime, textReview }) => {
        const row = document.createElement('tr');
        row.id = key;

        row.innerHTML = `
            <td>${driverFirstName} ${driverLastName}</td>
            <td>${customerName}</td>
            <td>${service}</td>
            <td>${origin}</td>
            <td>${destination}</td>
            <td>${fare}</td>
            <td>${completionTime}</td>
            <td>${textReview}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to filter order data
function filterHistoryData() {
    const filterInput = document.querySelector('#filterInput').value.trim().toLowerCase();

    // If search input is empty, show all orders
    if (filterInput === '') {
        renderHistoryTable(allOrders);
        return;
    }

    const filteredOrders = allOrders.filter(({ driverFirstName, driverLastName, service, origin, destination, completionTime, textReview }) => {
        const fullName = `${driverFirstName} ${driverLastName}`.toLowerCase();
        
        return (
            fullName.includes(filterInput) ||
            service.toLowerCase().includes(filterInput) ||
            origin.toLowerCase().includes(filterInput) ||
            destination.toLowerCase().includes(filterInput) ||
            (completionTime ? completionTime.toLowerCase().includes(filterInput) : false) ||
            (textReview ? textReview.toLowerCase().includes(filterInput) : false)
        );
    });

    renderHistoryTable(filteredOrders);
}


// Retrieving data for card in dashboard
function renderRecentTransactions(orders) {
    const recentTransactionsList = document.querySelector('#recentTransactions');
    recentTransactionsList.innerHTML = ''; // Clear previous content

    // Filter only completed transactions
    const completedOrders = orders.filter(order => order.status === "Completed");

    if (completedOrders.length === 0) {
        recentTransactionsList.innerHTML = '<tr><td colspan="3">No completed transactions found</td></tr>';
        return;
    }

    // Get the last 3 completed transactions
    const recentOrders = completedOrders.slice(-3).reverse();

    recentOrders.forEach(({ key, completionTime, driverFirstName, driverLastName, origin, destination, fare }) => {
        const row = document.createElement('tr');
        row.id = key;

        row.innerHTML = `
            <td>${completionTime}</td>
            <td>${driverFirstName} ${driverLastName}</td>
            <td>${origin}</td>
            <td>${destination}</td>
            <td>P${fare}</td>
        `;

        recentTransactionsList.appendChild(row);
    });
}

// Fetch data and update recent transactions
database.ref('Order').once('value', function (snapshot) {
    if (snapshot.exists()) {
        let orders = Object.entries(snapshot.val()).map(([key, order]) => ({
            key,
            ...order
        }));

        renderRecentTransactions(orders);
    } else {
        document.querySelector('#recentTransactions').innerHTML = '<tr><td colspan="3">No transactions found</td></tr>';
    }
}, function (error) {
    console.error("Error retrieving transactions:", error);
    document.querySelector('#recentTransactions').innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
});

// FUNCTION FOR RETRIEVING BOOKINGS -------------------------------------------------------------------------------------

let allBookings = []; // Store all accepted bookings for filtering

// Function to retrieve accepted bookings
function retrieveAcceptedBookings() {
    const tableBody = document.querySelector('#bookingList');

    database.ref('Order').once('value', function(snapshot) {
        if (snapshot.exists()) {
            allBookings = []; // Reset bookings before processing
            const bookings = snapshot.val();
            tableBody.innerHTML = '';

            Object.keys(bookings).forEach(function(key) {
                const booking = bookings[key];

                // Only process bookings with status "Accepted"
                if (booking.status === "Accepted") {
                    const driverName = `${booking.driverFirstName} ${booking.driverLastName}`; // Driver name from Order node
                    
                    // Fetch customer name using customerUID from the User node
                    database.ref('User/' + booking.customerUID).once('value', function(customerSnapshot) {
                        let customerName = "Unknown Customer"; // Default fallback name
                        
                        if (customerSnapshot.exists()) {
                            const customerData = customerSnapshot.val();
                            customerName = `${customerData.firstName} ${customerData.lastName}`;
                        }

                        // Store the booking details
                        allBookings.push({ key, ...booking, customerName, driverName });

                        // Render the table with updated bookings
                        renderBookingTable(allBookings);
                    }, function(error) {
                        console.error("Error fetching customer info:", error);
                    });
                }
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="7">No Accepted Bookings Found</td></tr>';
        }
    }, function(error) {
        console.error("Error retrieving data:", error);
        tableBody.innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
    });
}

// Function to render accepted bookings to the table
function renderBookingTable(bookings) {
    const tableBody = document.querySelector('#bookingList');
    tableBody.innerHTML = '';

    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No matching bookings found</td></tr>';
        return;
    }

    bookings.forEach(({ key, driverName, customerName, service, origin, destination }) => {
        const row = document.createElement('tr');
        row.id = key;

        row.innerHTML = `
            <td>${driverName}</td>
            <td>${customerName}</td>
            <td>${service}</td>
            <td>${origin}</td>
            <td>${destination}</td>
            <td>
                <button class="cancel-btn" data-id="${key}">Cancel</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Attach event listener to cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            cancelBooking(bookingId);
        });
    });
}

// Function to change status from "Accepted" to "Completed" with confirmation
function cancelBooking(bookingId) {
    // Ask for user confirmation
    const isConfirmed = confirm("Are you sure you want to cancel this booking?");

    if (isConfirmed) {
        database.ref(`Order/${bookingId}`).update({ status: "Cancelled" })
            .then(() => {
                console.log(`Booking ${bookingId} marked as Cancelled.`);
                retrieveAcceptedBookings(); // Refresh table after update
            })
            .catch(error => {
                console.error("Error updating booking status:", error);
                showAlert(`Error updating booking: ${error.message}`, "warning");
            });
    } else {
        console.log("Booking cancellation was aborted by the user.");
    }
}



// Function to filter accepted bookings
function filterBookingData() {
    const filterInput = document.querySelector('#filterInput').value.toLowerCase();

    const filteredBookings = allBookings.filter(({ driverName, customerName, service, origin, destination, status }) => {
        return (
            driverName.toLowerCase().includes(filterInput) ||
            customerName.toLowerCase().includes(filterInput) ||
            service.toLowerCase().includes(filterInput) ||
            origin.toLowerCase().includes(filterInput) ||
            destination.toLowerCase().includes(filterInput) ||
            status.toLowerCase().includes(filterInput)
        );
    });

    renderBookingTable(filteredBookings);
}



// FUNCTION FOR SEARCHING SPECIFIC DETAILS IN ROUTES SECTION ------------------------------------------------------------------


let allRoutes = []; // Store all routes for filtering

// Modify retrieveRoutes to update the Recent Routes card
function retrieveRoutes() {
    const tableBody = document.querySelector("#routeList");

    database.ref("Route").once("value", function(snapshot) {
        if (snapshot.exists()) {
            allRoutes = Object.entries(snapshot.val()).map(([key, route]) => ({
                key,
                ...route
            }));

            renderRouteTable(allRoutes);
            updateRecentRoutes(allRoutes); // Update the recent routes section
        } else {
            tableBody.innerHTML = '<tr><td colspan="6">No Routes found</td></tr>';
            updateRecentRoutes([]); // Handle no routes
        }
    }, function(error) {
        console.error("Error retrieving data:", error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
        updateRecentRoutes([]); // Handle errors
    });
}


// Function to render route data
function renderRouteTable(routes) {
    const tableBody = document.querySelector('#routeList');
    tableBody.innerHTML = '';

    // Update total route count
    document.querySelector('.route-count').textContent = routes.length;

    if (routes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No matching routes found</td></tr>';
        return;
    }

    routes.forEach(({ key, RouteID, origin, destination, distance, fare, service }) => {
        const row = document.createElement('tr');
        row.id = key;

        row.innerHTML = `
            <td>${RouteID}</td>
            <td>${origin}</td>
            <td>${destination}</td>
            <td>${distance}</td>
            <td>${fare}</td>
            <td>${service}</td>
            <td>
                <button onclick="showEditRouteModal(event, '${key}')">Edit</button>
                <button onclick="deleteRouteData('${key}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to filter route data
function filterRouteData() {
    const filterInput = document.querySelector('#filterInput').value.trim().toLowerCase();

    const filteredRoutes = allRoutes.filter(({ origin, destination, fare, service, distance }) => {
        return (
            origin.toLowerCase().includes(filterInput) ||
            destination.toLowerCase().includes(filterInput) ||
            fare.toLowerCase().includes(filterInput) ||
            service.toLowerCase().includes(filterInput) ||
            distance.toString().toLowerCase().includes(filterInput) // Include distance in filtering
        );
    });

    renderRouteTable(filteredRoutes);
}

/* 
    FOR THE EDIT FUNCTION IN ROUTER SECTION
*/

// Function to show the edit modal and populate it with route data
function showEditRouteModal(event, key) {
    event.preventDefault();
    const route = allRoutes.find(route => route.key === key);
    if (route) {
        document.getElementById('edit-key').value = route.key;
        document.getElementById('edit-origin').value = route.origin;
        document.getElementById('edit-destination').value = route.destination;
        document.getElementById('edit-distance').value = route.distance;
        document.getElementById('edit-fare').value = route.fare;
        document.getElementById('edit-service').value = route.service;
        document.getElementById('edit-route-modal').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Attach the submit event listener to the edit form
    const editForm = document.getElementById('editRoute-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditRouteFormSubmit);
    }

    // Other initialization code (e.g., retrieveRoutes, etc.)
    retrieveRoutes();
});

function handleEditRouteFormSubmit(event) {
    event.preventDefault();

    try {
        // Get the updated values from the form
        const key = document.getElementById('edit-key').value;
        const origin = document.getElementById('edit-origin').value;
        const destination = document.getElementById('edit-destination').value;
        const distance = document.getElementById('edit-distance').value;
        const fare = document.getElementById('edit-fare').value;
        const service = document.getElementById('edit-service').value;

        // Update the route in Firebase
        database.ref('Route/' + key).update({
            origin,
            destination,
            distance,
            fare,
            service
        }).then(() => {
            showAlert('Route updated successfully!', "success");
            closeEditRouteModal();
            retrieveRoutes(); // Refresh the route list
        }).catch((error) => {
            console.error('Error updating route:', error);
            showAlert('Failed to update route. Please try again.', "warning");
        });
    } catch (error) {
        console.error('Error in handleEditRouteFormSubmit:', error);
        showAlert('An error occurred. Please check the console for details.', "warning");
    }
}

function closeEditRouteModal() {
    document.getElementById('edit-route-modal').style.display = 'none';
}


async function deleteRouteData(routeKey) {
    // Ask for user confirmation
    const isConfirmed = await b_confirm("Are you sure you want to delete this route?");

    if (isConfirmed) {
        const routeRef = database.ref(`Route/${routeKey}`);

        routeRef.remove()
            .then(() => {
                console.log("Route deleted successfully");

                // Refresh the route list first
                retrieveRoutes();

                // Wait a bit and then reassign RouteIDs
                setTimeout(reassignRouteIDs, 1000); // Ensures Firebase updates first
            })
            .catch((error) => {
                console.error("Error deleting Route", error.message);
                showAlert(`Error deleting Route: ${error.message}`, "warning");
            });
    } else {
        console.log("Route deletion canceled by user.");
    }
}

function reassignRouteIDs() {
    const routeRef = database.ref("Route");

    routeRef.once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                let routes = [];
                
                snapshot.forEach(childSnapshot => {
                    const routeData = childSnapshot.val();
                    routes.push({ key: childSnapshot.key, ...routeData });
                });

                // Sort routes by existing RouteID (if they have one)
                routes.sort((a, b) => parseInt(a.RouteID) - parseInt(b.RouteID));

                // Reassign RouteIDs sequentially
                const updates = {};
                routes.forEach((route, index) => {
                    updates[`${route.key}/RouteID`] = String(index + 1).padStart(4, "0");
                });

                return routeRef.update(updates);
            }
        })
        .then(() => {
            console.log("Route IDs reassigned successfully");
            retrieveRoutes(); // Refresh the list after reassigning
        })
        .catch(error => {
            console.error("Error reassigning Route IDs:", error.message);
        });
}



function addRouteData(origin, destination, distance, fare, service) {
    const routeRef = database.ref('Route');

    // Step 1: Retrieve the highest existing RouteID
    routeRef.once("value")
        .then(snapshot => {
            let highestRouteID = 0;

            snapshot.forEach(childSnapshot => {
                const routeData = childSnapshot.val();
                if (routeData.RouteID) {
                    const numericId = parseInt(routeData.RouteID, 10);
                    if (!isNaN(numericId) && numericId > highestRouteID) {
                        highestRouteID = numericId;
                    }
                }
            });

            // Step 2: Generate new RouteID
            const newRouteID = String(highestRouteID + 1).padStart(4, "0");

            // Step 3: Generate a new unique key for the route
            const newRouteKey = routeRef.push().key;

            // Step 4: Prepare route data with RouteID
            const routeData = {
                RouteID: newRouteID, // Ensure unique sequential ID
                origin: origin,
                destination: destination,
                distance: distance,
                fare: fare,
                service: service
            };

            // Step 5: Save to database
            return routeRef.child(newRouteKey).set(routeData);
        })
        .then(() => {
            console.log("Route added successfully with RouteID");
            showAlert('Successfully added a new route', 'success')
            retrieveRoutes(); // Refresh route list
        })
        .catch(error => {
            console.error("Error adding route", error.message);
            showAlert(`Error adding route: ${error.message}`, "warning");
        });
}

function updateRecentRoutes() {
    const recentRoutesList = document.querySelector('#recentRoutesList');
    recentRoutesList.innerHTML = '<tr><td colspan="3">Loading recent routes...</td></tr>'; // Show loading text

    database.ref('Route').once('value', function(snapshot) {
        if (snapshot.exists()) {
            let routes = Object.entries(snapshot.val()).map(([key, route]) => ({
                key,
                ...route
            }));

            routes = routes.slice(-3).reverse(); // Get the 3 most recent routes

            if (routes.length > 0) {
                recentRoutesList.innerHTML = routes.map(({ origin, destination, fare }) => `
                    <tr>
                        <td>${origin} - ${destination}</td>
                        <td>P${fare}</td>
                    </tr>
                `).join('');
            } else {
                recentRoutesList.innerHTML = '<tr><td colspan="3">No recent routes available</td></tr>';
            }
        } else {
            recentRoutesList.innerHTML = '<tr><td colspan="3">No routes found</td></tr>';
        }
    }, function(error) {
        console.error("Error retrieving recent routes:", error);
        recentRoutesList.innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
    });
}

async function deleteArchivedDriverData(driverKey) {
    // Ask for user confirmation
    const isConfirmed = await b_confirm("Are you sure you want to delete this driver?");

    if (isConfirmed) {
        const employeeRef = database.ref(`Employee/${driverKey}`);

        employeeRef.remove()
            .then(() => {
                console.log("Employee deleted successfully");
                retrieveArchivedEmployees(); // Refresh the employee list
            })
            .catch((error) => {
                console.error("Error deleting employee", error.message);
                showAlert(`Error deleting employee: ${error.message}`, "warning");
            });
    } else {
        console.log("Employee deletion canceled by user.");
    }
}

async function deleteDriverData(driverKey) {
    const isConfirmed = await b_confirm("Are you sure you want to delete this driver?");

    if (isConfirmed) {
        const employeeRef = database.ref(`Employee/${driverKey}`);

        employeeRef.remove()
            .then(() => {
                console.log("Employee deleted successfully");
                
                // Refresh the employee list first
                retrieveEmployeeData();

                // Wait a bit and then reassign IDs
                setTimeout(reassignDriverIDs, 1000); // Delay ensures Firebase updates first
            })
            .catch((error) => {
                console.error("Error deleting employee", error.message);
                showAlert(`Error deleting employee: ${error.message}`, "danger");
            });
    } else {
        console.log("Employee deletion canceled by user.");
    }
}


async function deleteCustomerData(customerKey) {
    // Ask for user confirmation
    const isConfirmed = await b_confirm("Are you sure you want to delete this customer?");

    if (isConfirmed) {
        const customerRef = database.ref(`User/${customerKey}`);

        customerRef.remove()
            .then(() => {
                console.log("Customer deleted successfully");
                retrieveArchivedCustomerData(); // Refresh the employee list
            })
            .catch((error) => {
                console.error("Error deleting driver", error.message);
                showAlert(`Error deleting driver: ${error.message}`, "warning");
            });
    } else {
        console.log("Driver deletion canceled by user.");
    }
}


// Load Customers Function
function loadCustomers() {
    const customerList = document.getElementById('customerList');
    customerList.innerHTML = ''; // Clear the table

    db.ref('customers').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const customer = childSnapshot.val();
            const customerId = childSnapshot.key; // Firebase key (unique ID)

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>
                    <button onclick="archiveCustomer('${customerId}')">Archive</button>
                </td>
            `;
            customerList.appendChild(row);
        });
    });
}

// Load Customers Function
function archivedLoadCustomers() {
    const customerList = document.getElementById('archivedCustomerList');
    customerList.innerHTML = ''; // Clear the table

    db.ref('customers').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const customer = childSnapshot.val();
            const customerId = childSnapshot.key; // Firebase key (unique ID)

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>
                    <button onclick="archiveCustomer('${customerId}')">Archive</button>
                </td>
            `;
            customerList.appendChild(row);
        });
    });
}

// Call loadCustomers on page load
window.onload = loadCustomers;
window.onload = archivedLoadCustomers;


function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            const username = user.email || "Guest";

            const user_display_name = document.getElementById("user-display-name");
            if (user_display_name) {
                user_display_name.textContent = username;
            }
        } else {
            const currentPath = window.location.pathname;
            if (!currentPath.includes("login.html") && !currentPath.includes("signup.html")) {
                window.location.href = "login.html";
            }
        }
    })
}

function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(({ user }) => {
            const username = user.displayName || email; // Fallback to email if displayName is not set
            showAlert(`Login successful for user: ${username}`, "success");

            // Update the display name in the UI if applicable
            const userDisplayNameElement = document.getElementById("user-display-name");
            if (userDisplayNameElement) {
                userDisplayNameElement.textContent = username;
            }

            // Redirect to the home page
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error(`Login error [${error.code}]: ${error.message}`);
            showAlert(`Login failed: ${error.message}`, "warning");
        });
}

function addDriverData(fname, lname, email, bodyNum, contactNum, plateNum, driverPassword) {
    const adminUser = auth.currentUser;
    const adminEmail = adminUser?.email;
    const adminPassword = "vmmctoda";

    const accountType = "Driver";
    const fileInputs = {
        driverImage: document.getElementById("driverImage"),
        corFile: document.getElementById("corFile"),
        referenceLetter: document.getElementById("referenceLetter"),
        barangayClearance: document.getElementById("barangayClearance"),
        insurance: document.getElementById("insurance"),
        idPicture: document.getElementById("idPicture"),
        tricyclePicture: document.getElementById("tricyclePicture")
    };

    for (const key in fileInputs) {
        if (!fileInputs[key].files[0]) {
            showAlert(`Please upload ${key.replace(/([A-Z])/g, ' $1')}.`, "warning");
            return;
        }
    }

    if (bodyNum.length !== 3 || isNaN(bodyNum)) {
        showAlert("Body number must be a 3-digit number.", "warning");
        return;
    }
    if (contactNum.length !== 11 || isNaN(contactNum) || !contactNum.startsWith("09")) {
        showAlert("Contact number must be an 11-digit number starting with '09'.", "warning");
        return;
    }

    document.getElementById("loadingMessage").style.display = "block";

    const employeeRef = database.ref("Employee");

    // **Step 1: Get the highest existing driverId**
    employeeRef.once("value")
        .then(snapshot => {
            let highestDriverId = 0;
            snapshot.forEach(childSnapshot => {
                const driverData = childSnapshot.val();
                if (driverData.driverID) {
                    const numericId = parseInt(driverData.driverID, 10);
                    if (!isNaN(numericId) && numericId > highestDriverId) {
                        highestDriverId = numericId;
                    }
                }
            });

            const newDriverID = String(highestDriverId + 1).padStart(4, "0");
            console.log("New Driver ID:", newDriverID);

            const uploadPromises = {};
            const fileURLs = {};

            Object.entries(fileInputs).forEach(([key, input]) => {
                const file = input.files[0];
                const storageRef = storage.ref(`driverFiles/${email}_${key}_${Date.now()}`);
                uploadPromises[key] = storageRef.put(file).then(snapshot => snapshot.ref.getDownloadURL());
            });

            return Promise.all(Object.values(uploadPromises)).then(urls => {
                Object.keys(uploadPromises).forEach((key, index) => {
                    fileURLs[key] = urls[index];
                });

                return auth.createUserWithEmailAndPassword(email, driverPassword)
                    .then(({ user: newDriver }) => {
                        console.log("Driver added to Authentication successfully:", newDriver.uid);

                        const employeeData = {
                            driverID: newDriverID, // **Ensuring a unique ID**
                            lname, fname, email, bodyNum, contactNum, plateNum,
                            accountType, isArchived: "false", status: "offline",
                            uid: newDriver.uid,
                            imageUrl: fileURLs.driverImage,
                            corUrl: fileURLs.corFile,
                            referenceLetterUrl: fileURLs.referenceLetter,
                            barangayClearanceUrl: fileURLs.barangayClearance,
                            insuranceUrl: fileURLs.insurance,
                            idPictureUrl: fileURLs.idPicture,
                            tricyclePictureUrl: fileURLs.tricyclePicture
                        };

                        return employeeRef.child(newDriver.uid).set(employeeData);
                    });
            });
        })
        .then(() => {
            console.log("Driver details added successfully to the database.");
            return auth.signInWithEmailAndPassword(adminEmail, adminPassword);
        })
        .then(() => {
            console.log("Admin reauthenticated successfully.");
            retrieveEmployeeData();

            document.getElementById("addDriver-form").reset();
            closeAddDriverModal();
            showSuccessModal();
        })
        .catch(error => {
            console.error("Error:", error.message);
            showAlert(`Error: ${error.message}`, "danger");
        })
        .finally(() => {
            document.getElementById("loadingMessage").style.display = "none";
        });
}

function reassignDriverIDs() {
    database.ref('Employee').once('value', (snapshot) => {
        if (snapshot.exists()) {
            let employees = Object.entries(snapshot.val())
                .map(([key, employee]) => ({ key, ...employee }))
                .filter(emp => emp.isArchived === false || emp.isArchived === "false")
                .sort((a, b) => parseInt(a.driverID, 10) - parseInt(b.driverID, 10));

            // Reassign driverID from 0001 onwards
            employees.forEach((employee, index) => {
                const newDriverID = (index + 1).toString().padStart(4, '0'); // Format to 4 digits
                if (employee.driverID !== newDriverID) {
                    database.ref(`Employee/${employee.key}/driverID`).set(newDriverID);
                }
            });
        }
    }).catch(error => {
        console.error("Error reassigning driver IDs:", error);
    });
}


// Function to show success modal
function showSuccessModal() {
    const modal = document.getElementById("successModal");
    modal.style.display = "block";
    
    // Close the modal automatically after 3 seconds
    setTimeout(() => {
        modal.style.display = "none";
    }, 3000);
}

// Function to manually close the success modal
function closeSuccessModal() {
    document.getElementById("successModal").style.display = "none";
}

checkAuthState();

function logout() {
    auth.signOut()
        .then(() => {
            console.log("User logged out");
            window.location.href = "login.html";
        })
        .catch((error))
}

function handleForgotPassword(event) {
    event.preventDefault();
    const email = prompt("Enter your registered email address:");

    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent! Please check your inbox.");
            })
            .catch((error) => {
                console.error("Error sending password reset email:", error.message);
                showAlert(`Error: ${error.message}`, "danger");
            });
    } else {
        showAlert("Please enter a valid email address.", "warning");
    }
}


if (window.location.pathname.includes("login.html")) {
    document.getElementById("login-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email, password);
    });
}


// TOTAL COUNT ----------------------------------------------------------------------


// Customer
function updateCustomerCount() {
    const customerRef = firebase.database().ref('User');

    customerRef.on('value', (snapshot) => {
        const customerData = snapshot.val();
        if (customerData) {
            // Filter only active users (isArchived = "false" or false)
            const activeCustomers = Object.values(customerData).filter(user => user.isArchived === "false" || user.isArchived === false);
            const customerCount = activeCustomers.length;
            
            // Update the total count in the HTML
            document.querySelector('.customer-count').textContent = `${customerCount}`;
        } else {
            // No users found
            document.querySelector('.customer-count').textContent = "0";
        }
    });
}

// Archived Customer
function updateArchivedCustomerCount() {
    const customerRef = firebase.database().ref('User');

    customerRef.on('value', (snapshot) => {
        const customerData = snapshot.val();
        if (customerData) {
            // Filter only active users (isArchived = "false" or false)
            const activeCustomers = Object.values(customerData).filter(user => user.isArchived === "true" || user.isArchived === true);
            const customerCount = activeCustomers.length;
            
            // Update the total count in the HTML
            document.querySelector('.archived-customer-count').textContent = `${customerCount}`;
        } else {
            // No users found
            document.querySelector('.archived-customer-count').textContent = "0";
        }
    });
}

// Archived Customer
function updateArchivedDriverCount() {
    const driverRef = firebase.database().ref('Employee');

    driverRef.on('value', (snapshot) => {
        const driverData = snapshot.val();
        if (driverData) {
            // Filter only active users (isArchived = "false" or false)
            const activeDrivers = Object.values(driverData).filter(user => user.isArchived === "true" || user.isArchived === true);
            const driverCount = activeDrivers.length;
            
            // Update the total count in the HTML
            document.querySelector('.archived-employee-count').textContent = `${driverCount}`;
        } else {
            // No users found
            document.querySelector('.archived-employee-count').textContent = "0";
        }
    });
}

// Driver
function updateDriverCount() {
    const employeeRef = firebase.database().ref('Employee');

    employeeRef.on('value', (snapshot) => {
        const driverData = snapshot.val();
        if (driverData) {
            // Filter only active users (isArchived = "false" or false)
            const activeDrivers = Object.values(driverData).filter(user => user.isArchived === "false" || user.isArchived === false);
            const driverCount = activeDrivers.length;
            
            // Update the total count in the HTML
            document.querySelector('.employee-count').textContent = `${driverCount}`;
        } else {
            // No users found
            document.querySelector('.employee-count').textContent = "0";
        }
    });
}

// Function to update the count of accepted bookings
function updateBookingCount() {
    const bookingRef = firebase.database().ref('Order');

    bookingRef.on('value', (snapshot) => {
        const bookingData = snapshot.val();
        if (bookingData) {
            // Filter only bookings with status "Accepted"
            const acceptedBookings = Object.values(bookingData).filter(booking => booking.status === "Accepted");

            const bookingCount = acceptedBookings.length;
            
            // Update the total count in the HTML
            document.querySelector('.accepted-booking-count').textContent = `${bookingCount}`;
        } else {
            // No accepted bookings found
            document.querySelector('.accepted-booking-count').textContent = "0";
        }
    });
}


// Routes
function updateRouteCount() {
    const routeRef = firebase.database().ref('Route');

    routeRef.once('value', (snapshot) => {
        const routeData = snapshot.val();
        const routeCount = routeData ? Object.keys(routeData).length : 0;

        // Update the total count in the HTML
        document.querySelector('.route-count').textContent = `${routeCount}`;
    })
}

// Transaction
function updateOrderCount() {
    const orderRef = firebase.database().ref('Order');

    orderRef.once('value', (snapshot) => {
        const orderData = snapshot.val();

        // Filter orders to count only those with status "Completed"
        const completedOrderCount = orderData
            ? Object.values(orderData).filter(order => order.status === "Completed").length
            : 0;

        // Update the total count in the HTML
        document.querySelector('.transaction-count').textContent = `${completedOrderCount}`;
    }, (error) => {
        console.error("Error retrieving orders:", error);
        document.querySelector('.transaction-count').textContent = "Error";
    });
}

// Function for alerts
document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("alertContainer")) {
        let alertContainer = document.createElement("div");
        alertContainer.id = "alertContainer";
        alertContainer.className = "position-fixed bottom-0 end-0 p-3";
        alertContainer.style.zIndex = "1050";
        document.body.appendChild(alertContainer);
    }
});

function showAlert(message, type) {
    let alertContainer = document.getElementById("alertContainer");

    let svgIcon;
    if (type === "success") {
        svgIcon = `<svg class="alert-icon" width="24" height="24" fill="green" xmlns="http://www.w3.org/2000/svg"><path d="M10 15.172l-3.536-3.536-1.414 1.414 4.95 4.95 9.9-9.9-1.414-1.414z"/></svg>`;
    } else if (type === "danger") {
        svgIcon = `<svg class="alert-icon" width="24" height="24" fill="red" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm0 3.4l7 14H5l7-14zm-1 5h2v5h-2v-5zm0 7h2v2h-2v-2z"/></svg>`;
    } else if (type === "warning") {
        svgIcon = `<svg class="alert-icon" width="24" height="24" fill="orange" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm-1 7h2v5h-2V9zm0 7h2v2h-2v-2z"/></svg>`;
    } else {
        svgIcon = `<svg class="alert-icon" width="24" height="24" fill="blue" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm-1 7h2v5h-2V9zm0 7h2v2h-2v-2z"/></svg>`;
    }

    let alertDiv = document.createElement("div");
    alertDiv.className = `custom-alert custom-alert-${type} d-flex align-items-center`;
    alertDiv.innerHTML = `
        ${svgIcon}
        <div>${message}</div>
    `;

    alertContainer.appendChild(alertDiv);

    // Remove alert after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}





// Example trigger on page load
window.onload = function() {
    updateDriverCount();
    updateArchivedDriverCount();
    updateRouteCount();
    updateBookingCount();
    updateCustomerCount();
    updateArchivedCustomerCount();
    updateOrderCount();
    updateRecentRoutes();
}

if (window.location.pathname.includes("employee.html")){
    retrieveEmployeeData();
}

if (window.location.pathname.includes("customer.html")){
    retrieveCustomerData();
}

if (window.location.pathname.includes("archivedCustomer.html")){
    retrieveArchivedCustomerData();
}

if (window.location.pathname.includes("archivedDriver.html")){
    retrieveArchivedEmployees();
}

if (window.location.pathname.includes("routes.html")) {
    retrieveRoutes();
}

if (window.location.pathname.includes("history.html")) {
    retrieveHistory();
}

if (window.location.pathname.includes("bookings.html")) {
    retrieveAcceptedBookings();
}


// Redirecting of all "See all" in Dashboard -------------------------------------------

// Routes.html
document.getElementById('see-all-routes').addEventListener('click', function () {
    // Redirect to routes.html
    window.location.href = 'routes.html';
})

// Customer.html
document.getElementById('see-all-customer').addEventListener('click', function () {
    // Redirect to customer.html
    window.location.href = 'customer.html';
})

// history.html
document.getElementById('see-all-transactions').addEventListener('click', function () {
    // Redirect to customer.html
    window.location.href = 'history.html';
})

// Chat support function
// Ensures names are fetched correctly when opening chat

document.addEventListener("DOMContentLoaded", function () {
    const chatButton = document.getElementById("chatButton");
    const chatSelection = document.getElementById("chatSelection");
    const chatBox = document.getElementById("chatBox");
    const closeChat = document.getElementById("closeChat");
    const userList = document.getElementById("userList");
    const chatTitle = document.getElementById("chatTitle");
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendChat = document.getElementById("sendChat");

    var database = firebase.database();
    let currentChatType = "";
    let selectedUserUID = null;
    let userNames = {};

    chatButton.addEventListener("click", function () {
        chatSelection.classList.toggle("show");
    });

    window.selectChat = function (type) {
        currentChatType = type;
        chatSelection.classList.remove("show");
        chatBox.classList.add("show");
        chatTitle.textContent = type === "drivers" ? "Drivers Chat" : "Customers Chat";
        userList.innerHTML = "";
        chatMessages.innerHTML = ""; // Clear chat messages when switching chats

        if (type === "drivers") {
            loadDriverChats();
        } else {
            loadCustomerChats();
        }
    };

    function loadDriverChats() {
        const orderRef = database.ref("Order");

        orderRef.once("value", (snapshot) => {
            userList.innerHTML = "";
            if (snapshot.exists()) {
                snapshot.forEach((orderSnap) => {
                    const driverUID = orderSnap.key;
                    const driverData = orderSnap.val();

                    if (driverData.messagesDriver) {
                        let driverFullName = `${driverData.driverFirstName || "Unknown"} ${driverData.driverLastName || "Driver"}`;
                        userNames[driverUID] = driverFullName;

                        let listItem = document.createElement("li");
                        listItem.textContent = driverFullName;
                        listItem.onclick = () => openChat(driverUID, "messagesDriver");
                        userList.appendChild(listItem);
                    }
                });
            } else {
                userList.innerHTML = "<li>No driver messages found.</li>";
            }
        }).catch((error) => console.error("Error fetching drivers:", error));
    }

    function loadCustomerChats() {
        const orderRef = database.ref("Order");

        orderRef.once("value", (snapshot) => {
            userList.innerHTML = ""; // Clear previous list
            if (snapshot.exists()) {
                snapshot.forEach((orderSnap) => {
                    const customerUID = orderSnap.key; // Get customer UID
                    const customerData = orderSnap.val();

                    if (customerData.messagesCustomer) {
                        getCustomerNameFromOrder(customerUID, (customerFullName) => {
                            userNames[customerUID] = customerFullName; // Store name

                            let listItem = document.createElement("li");
                            listItem.textContent = customerFullName;
                            listItem.onclick = () => openChat(customerUID, "messagesCustomer");
                            userList.appendChild(listItem);
                        });
                    }
                });
            } else {
                userList.innerHTML = "<li>No customer messages found.</li>";
            }
        }).catch((error) => {
            console.error("Error fetching customers:", error);
        });
    }

    function getCustomerNameFromOrder(orderUID, callback) {
        if (!orderUID) {
            console.error("❌ Invalid orderUID:", orderUID);
            callback("Unknown Customer");
            return;
        }
    
        console.log(`🔹 Fetching order data for UID: ${orderUID}`);
    
        // Step 1: Get customerUID from Order
        database.ref(`Order/${orderUID}`).once("value")
            .then((orderSnapshot) => {
                if (!orderSnapshot.exists()) {
                    console.warn(`⚠️ No order found for UID: ${orderUID}`);
                    callback("Unknown Customer");
                    return;
                }
    
                let orderData = orderSnapshot.val();
                let customerUID = orderData.customerUID;
    
                if (!customerUID) {
                    console.warn(`⚠️ No customerUID found in Order/${orderUID}`);
                    callback("Unknown Customer");
                    return;
                }
    
                console.log(`✅ Found customerUID: ${customerUID}, Fetching customer name...`);
    
                // Step 2: Get customer's name from User
                database.ref(`User/${customerUID}`).once("value")
                    .then((userSnapshot) => {
                        if (!userSnapshot.exists()) {
                            console.warn(`⚠️ No user found for customerUID: ${customerUID}`);
                            callback("Unknown Customer");
                            return;
                        }
    
                        let userData = userSnapshot.val();
                        let customerFullName = `${userData.firstName || "Unknown"} ${userData.lastName || "Customer"}`;
                        callback(customerFullName);
                    })
                    .catch((error) => {
                        console.error("❌ Error fetching customer name:", error);
                        callback("Unknown Customer");
                    });
    
            })
            .catch((error) => {
                console.error("❌ Error fetching order data:", error);
                callback("Unknown Customer");
            });
    }

    window.openChat = function (userUID, messageType) {
        selectedUserUID = userUID;

        // Clear the chat messages before opening a new one
        chatMessages.innerHTML = "<p class='bot-message'>Loading chat...</p>";

        if (!userNames[userUID]) {
            getCustomerNameFromOrder(userUID, (userFullName) => {
                userNames[userUID] = userFullName;
                chatMessages.innerHTML = `<p class="bot-message">Chatting with ${userFullName}</p>`;
            });
        } else {
            chatMessages.innerHTML = `<p class="bot-message">Chatting with ${userNames[userUID]}</p>`;
        }

        const messagesRef = database.ref(`Order/${userUID}/${messageType}`).orderByChild("timestamp");

        messagesRef.off();
        messagesRef.on("child_added", (snapshot) => {
            let msgData = snapshot.val();
            displayMessage(msgData);
        });

        chatBox.dataset.messageType = messageType;
    };

    function displayMessage(msgData) {
        let messageElement = document.createElement("p");
        messageElement.className = msgData.senderType === "admin" ? "user-message" : "bot-message";
        messageElement.innerHTML = `<strong>${msgData.senderType}:</strong> ${msgData.text} <br> 
            <small>${formatTimestamp(msgData.timestamp)}</small>`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        let message = chatInput.value.trim();
        if (!selectedUserUID || message === "") return;

        let messageType = chatBox.dataset.messageType;
        let newMessage = {
            senderID: "admin",
            senderType: "admin",
            text: message,
            timestamp: Date.now()
        };

        database.ref(`Order/${selectedUserUID}/${messageType}`).push(newMessage);
        chatInput.value = "";
    }

    function formatTimestamp(timestamp) {
        let date = new Date(timestamp);
        let hours = date.getHours() % 12 || 12;
        let minutes = date.getMinutes().toString().padStart(2, "0");
        let amPm = date.getHours() >= 12 ? "PM" : "AM";
        let today = new Date();
        let dateString = today.toDateString() === date.toDateString() ? "Today" : date.toLocaleDateString();
        return `${dateString} at ${hours}:${minutes} ${amPm}`;
    }

    sendChat.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    closeChat.addEventListener("click", function () {
        chatBox.classList.remove("show");
    });
});

















