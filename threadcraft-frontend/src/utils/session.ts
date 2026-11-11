export function getOrcreateSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');

    if(!sessionId) {

        sessionId = 'guest-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        localStorage.setItem('sessionId', sessionId);
    }



    return sessionId;
}