"""Conversation specification for LLM-powered chatbot conversations."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from typing import Dict
from typing import List

from tiktoken.core import Encoding

from tokenomics.conversation_turn import ConversationTurn
from tokenomics.conversation_turn import TurnTokens
from tokenomics.system_prompt import SystemPrompt
from tokenomics.system_prompt import SystemTokens


@dataclass
class ConversationTokens:
    """Represents the token counts for system prompt and metadata.

    Attributes:
        system_prompt (SystemTokens): The number of tokens in the system prompt.
        turns (List[TurnTokens]): A list of tokens in each conversational turn.
    """

    system_prompt: SystemTokens
    turns: List[TurnTokens]


@dataclass
class Conversation:
    """Defines a sequence of conversation turns, representing a full dialogue session.

    Attributes:
        system_prompt (SystemPrompt): A prompt or instruction applied to the entire conversation.
        turns (List[ConversationTurn]): A list of conversation turns.
    """

    system_prompt: SystemPrompt
    turns: List[ConversationTurn]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Conversation:
        """Creates a Conversation instance from a dictionary.

        Args:
            data: A dictionary containing keys 'system_prompt' and 'turns' with respective data.

        Returns:
            An instance of Conversation constructed from the given data.
        """
        system_prompt = SystemPrompt.from_dict(data["system_prompt"])
        turns = [ConversationTurn.from_dict(x) for x in data["turns"]]
        return cls(system_prompt, turns)

    @classmethod
    def from_json(cls, json_file: Path) -> Conversation:
        """Creates a Conversation instance from a JSON file.

        Args:
            json_file: A Path object pointing to the JSON file containing the conversation data.

        Returns:
            An instance of Conversation constructed from the JSON file data.

        """
        with open(json_file) as fh:
            data = json.load(fh)

        return cls.from_dict(data)

    def count_tokens(self, encoder: Encoding) -> ConversationTokens:
        """Calculates the token counts for the system prompt and each turn.

        Args:
            encoder (Encoding): the tokenizer to be used for encoding.

        Returns:
            a dictionary with token counts for the "system_prompt" and "turns".
        """
        return ConversationTokens(
            system_prompt=self.system_prompt.count_tokens(encoder),
            turns=[turn.count_tokens(encoder) for turn in self.turns],
        )
