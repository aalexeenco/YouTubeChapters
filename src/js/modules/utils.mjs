export async function nodeAddedAsync(target, selector, signal) {
    return new Promise((resolve, reject) => {
        const mutationObserver = new MutationObserver((mutations, observer) => {
            for (let m of mutations) {
                for (let node of m.addedNodes) {
                    if (selector(node)) {
                        observer.disconnect();
                        signal?.removeEventListener("abort", abortHandler);
                        resolve(node);
                        return;
                    }
                }
            }
        });
        const abortHandler = () => {
            mutationObserver.disconnect();
            reject(new DOMException("Aborted", "AbortError"));
        };
        signal?.addEventListener("abort", abortHandler, { once: true });
        mutationObserver.observe(target, { childList: true, subtree: true });
    });
}
