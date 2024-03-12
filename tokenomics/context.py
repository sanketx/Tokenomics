"""Context specification for LLM-powered chatbot conversations."""

from __future__ import annotations

import json
from dataclasses import dataclass
from enum import Enum
from enum import auto
from typing import Any
from typing import Dict

from tiktoken.core import Encoding


class ContextType(Enum):
    """Enum representing types of external context in a conversation turn.

    Attributes:
        RAG: Context generated from a Retrieval-Augmented Generation system.
        API_CALL: Context generated from external API calls, e.g., database queries.
    """

    RAG = auto()
    API_CALL = auto()


@dataclass
class ContextTokens:
    """Represents the token counts for external contexts.

    Attributes:
        agent_query (int): The number of tokens in the agent's query.
        query_response (int): The number of tokens in the query response.
    """

    agent_query: int
    query_response: int


@dataclass
class Context:
    """Represents the external context associated with a conversation turn.

    Attributes:
        context_type (ContextType): The type of context, indicating its source or nature.
        agent_query (Dict[str, Any]): The query made by the agent, structured as key-value pairs.
        query_response (Dict[str, Any]): The response to the agent's query, also structured as key-value pairs.
    """

    context_type: ContextType
    agent_query: Dict[str, Any]
    query_response: Dict[str, Any]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Context:
        """Creates a Context instance from a dictionary.

        Args:
            data: A dictionary containing keys 'context_type', 'agent_query', and 'query_response' with respective data.

        Returns:
            An instance of Context constructed from the given data.
        """
        context_type = ContextType[data["context_type"]]
        return cls(context_type, data["agent_query"], data["query_response"])

    def count_tokens(self, encoder: Encoding) -> ContextTokens:
        """Calculates and updates the token counts for the query and response.

        Args:
            encoder (Encoding): the tokenizer to be used for encoding.

        Returns:
            a dictionary with token counts for the "agent_query", and "query_response".
        """
        return ContextTokens(
            agent_query=len(encoder.encode(json.dumps(self.agent_query))),
            query_response=len(encoder.encode(json.dumps(self.query_response))),
        )
