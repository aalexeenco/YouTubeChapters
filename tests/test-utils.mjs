export function timeout(ms) {
    return new Promise((_, reject) => setTimeout(reject, ms ?? 2000, "timeout"));
}

export function expectTimeout(promise) {
    return expect(Promise.race([promise, timeout()])).rejects.toMatch("timeout");
}
