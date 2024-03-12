"""System prompt specification for LLM-powered chatbot conversations."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from typing import Dict

from tiktoken.core import Encoding


@dataclass
class SystemTokens:
    """Represents the token counts for system prompt and metadata.

    Attributes:
        prompt (int): The number of tokens in the system prompt.
        metadata (int): The number of tokens in the serialized metadata.
    """

    prompt: int
    metadata: int


@dataclass
class SystemPrompt:
    """Represents the system prompt and associated metadata for a conversation.

    Attributes:
        prompt (str): A comprehensive description of the chatbot's persona and instructions for its behavior.
        metadata (Dict[str, Any]): Additional information such as date, time, and customer ID to personalize
        the conversation.
    """

    prompt: str
    metadata: Dict[str, Any]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> SystemPrompt:
        """Creates a SystemPrompt instance from a dictionary.

        Args:
            data: A dictionary containing keys 'prompt' and 'metadata' with respective data.

        Returns:
            An instance of SystemPrompt constructed from the given data.
        """
        return cls(data["prompt"], data["metadata"])

    def count_tokens(self, encoder: Encoding) -> SystemTokens:
        """Calculates the token counts for the prompt and metadata.

        Args:
            encoder (Encoding): the tokenizer to be used for encoding.

        Returns:
            a dictionary with token counts for the "prompt" and "metadata".
        """
        return SystemTokens(
            prompt=len(encoder.encode(self.prompt)),
            metadata=len(encoder.encode(json.dumps(self.metadata))),
        )
