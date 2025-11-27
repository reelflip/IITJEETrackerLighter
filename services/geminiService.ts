// This service has been deprecated as per the request to remove AI models.
// The file is kept to avoid import errors if any cached references exist, 
// but it exports empty placeholders.

export const startChat = async () => {
    console.warn("AI features are disabled.");
    return null;
};

export const sendMessageStream = async function* (message: string) {
    yield "AI features have been disabled in this version.";
};