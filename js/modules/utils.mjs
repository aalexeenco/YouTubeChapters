export async function nodeAddedAsync(target, selector) {
    return new Promise((resolve) => {
        const mutationObserver = new MutationObserver((mutations, observer) => {
            const addedNode = mutations
                .flatMap((m) => [...m.addedNodes])
                .find(selector);
            if (addedNode) {
                observer.disconnect();
                resolve();
            }
        });
        mutationObserver.observe(target, { childList: true, subtree: true });
    });
}
