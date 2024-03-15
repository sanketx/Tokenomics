import { createAvatar, createMessageBubble, createMessageWrapper } from './createElement.js';


export function createSystemPromptMessage(prompt, metadata) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('system-prompt');

    const heading = document.createElement('h3');
    heading.textContent = 'System Prompt';
    wrapper.appendChild(heading);

    const paragraph = document.createElement('p');
    paragraph.textContent = prompt;
    wrapper.appendChild(paragraph);

    return wrapper;
}

export function createUserPrompt(text) {
    const wrapper = createMessageWrapper();
    wrapper.style.justifyContent = 'flex-end'; // Align user messages to the right

    const avatar = createAvatar('assets/user-avatar.jpg'); // Use user avatar image
    const messageBubble = createMessageBubble(text, 'user-prompt');
    wrapper.appendChild(messageBubble);
    wrapper.appendChild(avatar); // Place avatar to the right of the message
    return wrapper;
}

export function createAgentResponse(text) {
    const wrapper = createMessageWrapper();
    const img_src = "https://www.pngkey.com/png/detail/408-4081831_favicon-gear.png";
    const avatar = createAvatar(img_src); // Use agent avatar image
    const messageBubble = createMessageBubble(text, 'agent-response');
    wrapper.appendChild(avatar);
    wrapper.appendChild(messageBubble);
    return wrapper;
}

export function createAgentContextMessage(text) {
    const wrapper = createMessageWrapper();
    wrapper.style.justifyContent = 'flex-start'; // Align agent context messages to the left
    const img_src = "https://www.pngkey.com/png/detail/408-4081831_favicon-gear.png";
    const avatar = createAvatar(img_src); // Use agent avatar image
    const messageBubble = createMessageBubble(text, 'agent-query');
    wrapper.appendChild(avatar);
    wrapper.appendChild(messageBubble); // Place avatar to the left of the message
    return wrapper;
}

export function createDatabaseContextMessage(text) {
    const wrapper = createMessageWrapper();
    wrapper.style.justifyContent = 'flex-end'; // Align database response messages to the right

    const avatar = createAvatar('assets/database-avatar.png'); // Use database avatar image
    const messageBubble = createMessageBubble(text, 'database-response');
    wrapper.appendChild(messageBubble);
    wrapper.appendChild(avatar); // Place avatar to the right of the message
    return wrapper;
}

export function createTokenMessage(data, cost, className) {
    const wrapper = document.createElement('div');
    wrapper.classList.add(className);

    const p1 = document.createElement('p');
    p1.textContent = `Prompt Tokens: ${data.prompt_tokens}`;
    p1.style.margin = "0px";
    wrapper.appendChild(p1)

    const p2 = document.createElement('p');
    p2.textContent = `API Input Tokens: ${data.input_tokens}`;
    p2.style.margin = "0px";
    wrapper.appendChild(p2)

    const p3 = document.createElement('p');
    p3.textContent = `API Output Tokens: ${data.output_tokens}`;
    p3.style.margin = "0px";
    wrapper.appendChild(p3)

    const p4 = document.createElement('p');
    p4.textContent = `API Cost: \$${(0.01 * cost).toPrecision(4)}`;
    p4.style.margin = "0px";
    wrapper.appendChild(p4)

    return wrapper;
}
