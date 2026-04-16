export function timeout(ms) {
    return new Promise((_, reject) => setTimeout(reject, ms ?? 2000, "timeout"));
}

export function expectTimeout(promise, timeoutMillis) {
    return expect(Promise.race([promise, timeout(timeoutMillis)])).rejects.toMatch("timeout");
}
