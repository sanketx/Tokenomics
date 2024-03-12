"""Calculates and displays the cost of LLM-powered chatbot conversations."""

import argparse
from pathlib import Path

import tiktoken

from tokenomics.conversation import Conversation
from tokenomics.metrics import ConversationMetrics
from tokenomics.metrics import LLMConfig


encoder = tiktoken.get_encoding("cl100k_base")

llm_configs = {
    "gpt-3.5": LLMConfig(
        context_size=16000,
        input_cost=0.5,
        output_cost=1.5,
        encoder=encoder,
    ),
    "gpt-4": LLMConfig(
        context_size=128000,
        input_cost=10.0,
        output_cost=30.0,
        encoder=encoder,
    ),
}


def parse_args() -> argparse.Namespace:
    """Parses and returns command line arguments.

    Returns:
        An argparse.Namespace object containing the parsed command line arguments.
    """
    parser = argparse.ArgumentParser(
        description="Calculate the cost of a conversation using an LLM."
    )
    parser.add_argument(
        "json_file", type=str, help="Path to the JSON file containing the conversation."
    )
    parser.add_argument(
        "llm_config",
        type=str,
        choices=["gpt-4", "gpt-3.5"],
        help="LLM configuration to use (gpt-4 or gpt-3.5).",
    )

    return parser.parse_args()


def calculate_cost() -> None:
    """Calculates and prints the cost of a conversation based on the LLM config."""
    args = parse_args()

    llm_config = llm_configs[args.llm_config]
    json_file = Path(args.json_file)

    conversation = Conversation.from_json(json_file)
    metrics = ConversationMetrics(conversation, llm_config)
    cost = metrics.conversation_cost()

    for key, value in cost.items():
        print(f"{key}: ${value * 0.01:.4f}")


if __name__ == "__main__":
    calculate_cost()
