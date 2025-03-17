// This script modifies the auth.js file to bypass email verification
// Use this only for testing purposes when you can't get email verification working

import fs from "fs";
import path from "path";

const authFilePath = path.join(process.cwd(), "routes", "auth.js");

try {
    console.log("Reading auth.js file...");
    let content = fs.readFileSync(authFilePath, "utf8");

    // Find the user creation part and add isVerified: true
    const originalLine = "const user = new User({";
    const modifiedLine =
        "const user = new User({\n            isVerified: true, // Auto-verify users for testing";

    if (content.includes(modifiedLine)) {
        console.log("Email verification is already bypassed.");
    } else {
        content = content.replace(originalLine, modifiedLine);

        fs.writeFileSync(authFilePath, content, "utf8");
        console.log(
            "Successfully modified auth.js to bypass email verification."
        );
        console.log(
            "IMPORTANT: Restart the server for changes to take effect."
        );
        console.log(
            "SECURITY WARNING: This is for testing only. Remove this modification in production."
        );
    }
} catch (error) {
    console.error("Error modifying auth.js:", error.message);
}
