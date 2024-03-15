import {
    createAgentContextMessage,
    createAgentResponse,
    createDatabaseContextMessage,
    createTokenMessage,
    createUserPrompt
} from "./messageCreation.js";

import { displayContextArea, displayTokenArea, displayTotalCost } from "./displayAreas.js";


export function updateConversation(data, tokens) {
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
                const message = createTokenMessage(x.context_usage, x.context_cost, 'context-token');
                wrapper.appendChild(message);
            }, delay);
            delay += delayIncrement;
        }

        setTimeout(() => {
            const message = createTokenMessage(x.conversation_usage, x.conversation_cost, 'conversation-token');
            wrapper.appendChild(message);
            tokenArea.appendChild(wrapper);
        }, delay);

        delay += delayIncrement;
    })

    setTimeout(() => {
        displayTotalCost(tokens);
    }, delay);
}



