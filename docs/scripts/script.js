// document.getElementById('jsonInput').style.opacity = 0;
// document.getElementById('jsonInput').addEventListener('change', handleFileSelect);

// function handleFileSelect(event) {
//     const file = event.target.files[0];
//     if (!file) {
//         return;
//     }

//     const fileNameDisplay = document.getElementById('fileName');
//     fileNameDisplay.textContent = file.name; // Update the file name display
//     readFile(file);
// }

// function readFile(file) {
//     const fileReader = new FileReader();
//     fileReader.onload = (e) => {
//         const content = e.target.result;
//         try {
//             const data = JSON.parse(content);
//             updateConversation(data);
//         } catch (error) {
//             console.error('Error parsing JSON:', error);
//         }
//     };
//     fileReader.readAsText(file);
// }

window.addEventListener('DOMContentLoaded', (event) => {
    loadConversation();
});

function loadConversation() {
    fetch('https://raw.githubusercontent.com/sanketx/Tokenomics/main/conversations/conversation_0.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateConversation(data);
        })
}


function updateConversation(data) {
    const conversationArea = document.getElementById('conversationArea');
    conversationArea.style.display = 'block'; // Make the conversation area visible
    conversationArea.innerHTML = ''; // Clear previous content

    let delay = 0; // Starting delay in milliseconds
    const delayIncrement = 200; // Delay increment for each message

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
        displayContextArea(data.system_prompt);
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
}

function displayContextArea(system_prompt) {
    const contextArea = document.getElementById('contextArea');
    contextArea.style.display = 'block'; // Make the context area visible
    contextArea.innerHTML = ''; // Clear previous content

    // Create the system prompt message
    const systemPromptMessage = createSystemPromptMessage(system_prompt.prompt, system_prompt.metadata);
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