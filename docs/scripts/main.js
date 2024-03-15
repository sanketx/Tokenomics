import { fetchJson } from './fetchJson.js';
import { updateConversation } from './updateConversation.js';
import { url1, url2 } from './urls.js';


window.addEventListener('DOMContentLoaded', (event) => {
    Promise.all([fetchJson(url1), fetchJson(url2)])
        .then(([data1, data2]) => updateConversation(data1, data2))
        .catch(error => console.error('Fetching error:', error));
});
