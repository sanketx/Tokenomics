"""Module for calculating conversation metrics and costs in LLM-powered chatbots.

This module includes classes for configuring the LLM, tracking API usage and costs,
managing turn states and metrics, and computing overall conversation metrics.
"""

from __future__ import annotations

import dataclasses
from dataclasses import dataclass
from dataclasses import field
from typing import Dict
from typing import List
from typing import Optional

from tiktoken import Encoding

from tokenomics.conversation import Conversation

from .conversation_turn import TurnTokens


@dataclass
class LLMConfig:
    """Configuration settings for a Large Language Model (LLM) API.

    Attributes:
        context_size (int): The maximum number of tokens the LLM can consider in each request.
        input_cost (float): Cost in cents per thousand input tokens.
        output_cost (float): Cost in cents per thousand output tokens.
        encoder (Encoding): The encoder used for tokenizing inputs.
    """

    context_size: int
    input_cost: float
    output_cost: float
    encoder: Encoding


@dataclass
class APIUsage:
    """Tracks the number of tokens used in prompts, inputs, and outputs for API calls.

    Attributes:
        prompt_tokens (int): The number of tokens in the user prompt.
        input_tokens (int): The number of tokens in the input including context.
        output_tokens (int): The number of tokens generated in the output.
    """

    prompt_tokens: int
    input_tokens: int
    output_tokens: int

    def calculate_cost(self, config: LLMConfig) -> float:
        """Calculates the cost of an API call based on token usage and config rates.

        Args:
            config (LLMConfig): Configuration settings for the LLM.

        Returns:
            float: The calculated cost of the API call.
        """
        cost = self.input_tokens * config.input_cost
        cost += self.output_tokens * config.output_cost
        return cost * 0.001


@dataclass
class TurnState:
    """Represents the state of a conversation turn, specifically token counts and context size.

    Attributes:
        system_tokens (int): The number of tokens in the system prompt.
        context_size (int): The context size limit of the LLM.
        history_tokens (int): The cumulative number of tokens from previous turns. Defaults to 0.
    """

    system_tokens: int
    context_size: int
    history_tokens: int = 0

    def next_state(self, new_tokens: int) -> TurnState:
        """Calculates the next state of the conversation based on new token usage.

        Args:
            new_tokens (int): The number of tokens to add to the history for the next turn.

        Returns:
            TurnState: A new TurnState instance with updated history tokens.
        """
        history_tokens = self.history_tokens + new_tokens
        return dataclasses.replace(self, history_tokens=history_tokens)


@dataclass
class TurnMetrics:
    """Computes and stores API usage and cost metrics for a single turn in a conversation.

    Attributes:
        conversation_usage (APIUsage): API usage details for the conversation in this turn.
        context_usage (Optional[APIUsage]): API usage details for additional context queries, if any.
        conversation_cost (float): The calculated cost of the conversation part of the turn.
        context_cost (Optional[float]): The calculated cost of the context query part of the turn, if applicable.
    """

    conversation_usage: APIUsage = field(init=False)
    context_usage: Optional[APIUsage] = field(init=False)

    conversation_cost: float = 0.0
    context_cost: Optional[float] = None

    def calculate_usage(self, turn: TurnTokens, state: TurnState) -> TurnState:
        """Calculates and records the API usage based on the turn data and current state.

        Args:
            turn (TurnTokens): The tokens for the current turn.
            state (TurnState): The current state of the conversation.

        Returns:
            TurnState: The next state of the conversation after accounting for this turn's token usage.
        """
        context = turn.context
        prompt_tokens = turn.user_prompt
        response_tokens = turn.agent_response

        input_tokens = state.system_tokens + state.history_tokens + prompt_tokens
        input_tokens = min(state.context_size, input_tokens)  # clip to context size

        if context is not None:
            # the first chatbot response is a query executed on the backend
            context_usage = APIUsage(prompt_tokens, input_tokens, context.agent_query)

            # the query response adds context for the chatbot to craft a reply
            input_tokens = min(state.context_size, input_tokens + context.query_response)
        else:
            context_usage = None

        self.conversation_usage = APIUsage(prompt_tokens, input_tokens, response_tokens)
        self.context_usage = context_usage

        # the user prompt and agent response are now added to the conversation history
        return state.next_state(prompt_tokens + response_tokens)

    def calculate_cost(self, config: LLMConfig) -> None:
        """Calculates the costs for conversation and context API usage based on API costs.

        Args:
            config (LLMConfig): Configuration settings for the LLM API.
        """
        if self.context_usage is not None:
            self.context_cost = self.context_usage.calculate_cost(config)

        self.conversation_cost = self.conversation_usage.calculate_cost(config)


@dataclass
class ConversationMetrics:
    """Tracks and calculates metrics and costs for an entire conversation.

    Attributes:
        conversation (Conversation): The conversation object being analyzed.
        config (LLMConfig): LLM API configuration settings.
        metrics (List[TurnMetrics]): A list of metrics for each turn in the conversation.
    """

    conversation: Conversation
    config: LLMConfig
    metrics: List[TurnMetrics] = field(init=False)

    def __post_init__(self) -> None:
        """Calculates conversation metrics - token counts and costs for each turn."""
        tokens = self.conversation.count_tokens(self.config.encoder)
        system_prompt = tokens.system_prompt
        system_tokens = system_prompt.prompt + system_prompt.metadata

        # there is no history at the start of a conversation
        state = TurnState(system_tokens, self.config.context_size, history_tokens=0)
        self.metrics = [TurnMetrics() for _ in tokens.turns]

        for turn, turn_metric in zip(tokens.turns, self.metrics):
            state = turn_metric.calculate_usage(turn, state)
            turn_metric.calculate_cost(self.config)

    def conversation_cost(self) -> Dict[str, float]:
        """Aggregates the costs for the entire conversation.

        Returns:
            Dict[str, float]: A dictionary with detailed cost breakdown for the conversation.
        """
        conversation_costs = [x.conversation_cost for x in self.metrics]
        context_costs = [x.context_cost for x in self.metrics if x.context_cost is not None]

        conversation_cost = sum(conversation_costs)
        context_cost = sum(context_costs)
        total_cost = conversation_cost + context_cost

        return {
            "conversation_cost": conversation_cost,
            "context_cost": context_cost,
            "total_cost": total_cost,
        }
