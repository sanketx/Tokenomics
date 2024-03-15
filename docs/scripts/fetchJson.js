export function fetchJson(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for url: ' + url);
            }
            return response.json();
        });
}