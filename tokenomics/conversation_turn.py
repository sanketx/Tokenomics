"""Conversation turn specification for LLM-powered chatbot conversations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from typing import Dict
from typing import Optional

from tiktoken.core import Encoding

from tokenomics.context import Context
from tokenomics.context import ContextTokens


@dataclass
class TurnTokens:
    """Represents the token counts for a single conversational turn.

    Attributes:
        user_prompt (int): The number of tokens in the user's input.
        agent_response (int): The number of tokens in the agent's response.
        context (Optional[ContextTokens]): The number of tokens in the external context.
    """

    user_prompt: int
    agent_response: int
    context: Optional[ContextTokens]


@dataclass
class ConversationTurn:
    """Models a single turn in a conversation, comprising user input and agent response.

    Attributes:
        user_prompt (str): The user's input or question.
        agent_response (str): The chatbot's response to the user's input.
        context (Optional[Context]): Optional external context relevant to this turn.
    """

    user_prompt: str
    agent_response: str
    context: Optional[Context]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> ConversationTurn:
        """Creates a ConversationTurn instance from a dictionary.

        Args:
            data: A dictionary containing keys 'user_prompt', 'agent_response', and 'context' with respective data.

        Returns:
            An instance of ConversationTurn constructed from the given data.
        """
        if data["context"] is None:
            context = None
        else:
            context = Context.from_dict(data["context"])

        return cls(data["user_prompt"], data["agent_response"], context)

    def count_tokens(self, encoder: Encoding) -> TurnTokens:
        """Calculates the token counts for the prompt, response, and context.

        Args:
            encoder (Encoding): the tokenizer to be used for encoding.

        Returns:
            a dictionary with token counts for the "prompt", "response, and "context".
        """
        token_count = TurnTokens(
            user_prompt=len(encoder.encode(self.user_prompt)),
            agent_response=len(encoder.encode(self.agent_response)),
            context=None,
        )

        if self.context is not None:
            token_count.context = self.context.count_tokens(encoder)

        return token_count
