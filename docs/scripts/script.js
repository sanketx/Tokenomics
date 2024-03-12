window.addEventListener('DOMContentLoaded', (event) => {
    Promise.all([fetchJson(url1), fetchJson(url2)])
        .then(([data1, data2]) => updateConversation(data1, data2))
        .catch(error => console.error('Fetching error:', error));
});

function fetchJson(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for url: ' + url);
            }
            return response.json();
        });
}

const url1 = 'https://raw.githubusercontent.com/sanketx/Tokenomics/main/conversations/conversation_0.json'
const url2 = 'https://raw.githubusercontent.com/sanketx/Tokenomics/main/conversations/metrics_0.json'


function updateConversation(data, tokens) {
    const conversationArea = document.getElementById('conversationArea');
    conversationArea.style.display = 'block'; // Make the conversation area visible
    conversationArea.innerHTML = ''; // Clear previous content

    let delay = 0; // Starting delay in milliseconds
    const delayIncrement = 100; // Delay increment for each message

    if (data.turns) {
        data.turns.forEach(turn => {
            setTimeout(() => {
                conversationArea.appendChild(createUserPrompt(turn.user_prompt));
            }, delay);

            setTimeout(() => {
                conversationArea.appendChild(createAgentResponse(turn.agent_response));
            }, delay + delayIncrement);

            delay += (2 * delayIncrement);
        });
    }

    // Display the contextArea after the conversationArea has been updated
    setTimeout(() => {
        displayContextArea(data);
    }, delay);

    delay += delayIncrement;

    // Display the context messages
    data.turns.forEach(turn => {
        if (turn.context) {
            setTimeout(() => {
                const agentQueryMessage = createAgentContextMessage(JSON.stringify(turn.context.agent_query, null, 2));
                const contextArea = document.getElementById('contextArea');
                contextArea.appendChild(agentQueryMessage);
            }, delay);

            setTimeout(() => {
                const databaseResponseMessage = createDatabaseContextMessage(JSON.stringify(turn.context.query_response, null, 2));
                const contextArea = document.getElementById('contextArea');
                contextArea.appendChild(databaseResponseMessage);
            }, delay + delayIncrement);

            delay += (2 * delayIncrement);
        }
    });

    // Display the tokenArea next
    setTimeout(() => {
        displayTokenArea(tokens);
    }, delay);

    delay += delayIncrement;

    tokens.metrics.forEach(x => {
        const tokenArea = document.getElementById('tokenArea');
        const wrapper = document.createElement('div');
        wrapper.classList.add('count-wrapper');

        if (x.context_usage) {
            setTimeout(() => {
                const message = createTokenMessage(x.context_usage, 'context-token');
                wrapper.appendChild(message);
            }, delay);
            delay += delayIncrement;
        }

        setTimeout(() => {
            const message = createTokenMessage(x.conversation_usage, 'conversation-token');
            wrapper.appendChild(message);

            cost_str = `Conversation API Cost: \$${(0.01 * x.conversation_cost).toPrecision(4)}`;
            const p1 = document.createElement('p');
            p1.textContent = cost_str;
            p1.style.marginBottom = "5px";
            // wrapper.append(p1)

            tokenArea.appendChild(wrapper);
        }, delay);

        delay += delayIncrement;
    })

    setTimeout(() => {
        displayTotalCost(tokens);
    }, delay);
}

function displayTokenArea(tokens) {
    const tokenArea = document.getElementById('tokenArea');
    tokenArea.style.display = 'block'; // Make the tokent area visible
    tokenArea.innerHTML = ''; // Clear previous content

    const wrapper = document.createElement('div');
    wrapper.classList.add('token-count');

    const heading = document.createElement('h3');
    heading.textContent = 'Token Metrics';
    wrapper.appendChild(heading);

    console.log(tokens.system_tokens);

    const p1 = document.createElement('p');
    p1.textContent = `System Prompt Tokens: ${tokens.system_tokens}`;
    p1.style.margin = "0px";
    wrapper.append(p1)

    tokenArea.appendChild(wrapper);
}

function displayTotalCost(tokens) {
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

function createTokenMessage(data, className) {
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

    return wrapper;
}

function displayContextArea(data) {
    const contextArea = document.getElementById('contextArea');
    contextArea.style.display = 'block'; // Make the context area visible
    contextArea.innerHTML = ''; // Clear previous content

    // Create the system prompt message
    const systemPromptMessage = createSystemPromptMessage(data.system_prompt.prompt, data.system_prompt.metadata);
    contextArea.appendChild(systemPromptMessage);
}

function createSystemPromptMessage(prompt, metadata) {
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

function createUserPrompt(text) {
    const wrapper = createMessageWrapper();
    wrapper.style.justifyContent = 'flex-end'; // Align user messages to the right

    const avatar = createAvatar('assets/user-avatar.jpg'); // Use user avatar image
    const messageBubble = createMessageBubble(text, 'user-prompt');
    wrapper.appendChild(messageBubble);
    wrapper.appendChild(avatar); // Place avatar to the right of the message
    return wrapper;
}

function createAgentResponse(text) {
    const wrapper = createMessageWrapper();
    img_src = "https://www.pngkey.com/png/detail/408-4081831_favicon-gear.png";
    const avatar = createAvatar(img_src); // Use agent avatar image
    const messageBubble = createMessageBubble(text, 'agent-response');
    wrapper.appendChild(avatar);
    wrapper.appendChild(messageBubble);
    return wrapper;
}

function createAgentContextMessage(text) {
    const wrapper = createMessageWrapper();
    wrapper.style.justifyContent = 'flex-start'; // Align agent context messages to the left
    img_src = "https://www.pngkey.com/png/detail/408-4081831_favicon-gear.png";
    const avatar = createAvatar(img_src); // Use agent avatar image
    const messageBubble = createMessageBubble(text, 'agent-query');
    wrapper.appendChild(avatar);
    wrapper.appendChild(messageBubble); // Place avatar to the left of the message
    return wrapper;
}

function createDatabaseContextMessage(text) {
    const wrapper = createMessageWrapper();
    wrapper.style.justifyContent = 'flex-end'; // Align database response messages to the right

    const avatar = createAvatar('assets/database-avatar.png'); // Use database avatar image
    const messageBubble = createMessageBubble(text, 'database-response');
    wrapper.appendChild(messageBubble);
    wrapper.appendChild(avatar); // Place avatar to the right of the message
    return wrapper;
}

function createMessageWrapper() {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message');
    return messageWrapper;
}

function createAvatar(imagePath) {
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.style.backgroundImage = `url(${imagePath})`; // Set image as background
    return avatar;
}

function createMessageBubble(text, className) {
    const messageBubble = document.createElement('div');
    messageBubble.classList.add(className);
    messageBubble.textContent = text;
    return messageBubble;
}