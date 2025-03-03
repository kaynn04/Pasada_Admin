const admin = require('firebase-admin');

// Load service account key (replace with the path to your service account JSON file)
const serviceAccount = require('D:\Downloads\Admin---Pasada-main\private');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pasada-97a81-default-rtdb.asia-southeast1.firebasedatabase.app", // Replace with your Firebase database URL
});

// Export initialized services
const auth = admin.auth();
const database = admin.database();

/**
 * Deletes a user from Firebase Authentication and their data from the database.
 * @param {string} uid - The UID of the user to delete.
 * @returns {Promise<void>} Resolves when both deletion processes are complete.
 */
async function deleteUser(uid) {
    try {
        // Delete user from Firebase Authentication
        await auth.deleteUser(uid);

        // Remove user data from the database
        await database.ref(`Employee/${uid}`).remove();

        console.log(`Successfully deleted user with UID: ${uid}`);
    } catch (error) {
        console.error(`Error deleting user with UID: ${uid}`, error.message);
        throw error; // Propagate error to be handled by the API
    }
}

module.exports = { deleteUser };