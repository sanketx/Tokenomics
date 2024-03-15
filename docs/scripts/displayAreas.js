import { createSystemPromptMessage } from "./messageCreation.js";


export function displayTokenArea(tokens) {
    const tokenArea = document.getElementById('tokenArea');
    tokenArea.style.display = 'block'; // Make the tokent area visible
    tokenArea.innerHTML = ''; // Clear previous content

    const wrapper = document.createElement('div');
    wrapper.classList.add('token-count');

    const heading = document.createElement('h3');
    heading.textContent = 'Token Metrics';
    wrapper.appendChild(heading);

    const p1 = document.createElement('p');
    p1.textContent = `System Prompt Tokens: ${tokens.system_tokens}`;
    p1.style.margin = "0px";
    wrapper.append(p1)

    tokenArea.appendChild(wrapper);
}

export function displayTotalCost(tokens) {
    const tokenArea = document.getElementById('tokenArea');
    const wrapper = document.createElement('div');
    wrapper.classList.add('token-count');

    const heading = document.createElement('h3');
    heading.textContent = 'Cumulative API Costs';
    wrapper.appendChild(heading);

    const p2 = document.createElement('p');
    p2.textContent = `Context API Cost: \$${(0.01 * tokens.context_cost).toPrecision(4)}`;
    p2.style.margin = "0px";
    wrapper.append(p2)

    const p3 = document.createElement('p');
    p3.textContent = `Conversation API Cost: \$${(0.01 * tokens.conversation_cost).toPrecision(4)}`;
    p3.style.margin = "0px";
    wrapper.append(p3)

    const p4 = document.createElement('p');
    p4.textContent = `Total API Cost: \$${(0.01 * tokens.total_cost).toPrecision(4)}`;
    p4.style.margin = "0px";
    wrapper.append(p4)

    tokenArea.appendChild(wrapper);
}


export function displayContextArea(data) {
    const contextArea = document.getElementById('contextArea');
    contextArea.style.display = 'block'; // Make the context area visible
    contextArea.innerHTML = ''; // Clear previous content

    // Create the system prompt message
    const systemPromptMessage = createSystemPromptMessage(data.system_prompt.prompt, data.system_prompt.metadata);
    contextArea.appendChild(systemPromptMessage);
}