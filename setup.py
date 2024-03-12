"""Setup script for the tokenomics package."""

from setuptools import setup


setup(
    name="tokenomics",
    version="0.1.0",
    author="Sanket Gupte",
    author_email="sanketg@stanford.edu",
    packages=["tokenomics"],
    install_requires=["tiktoken"],
    entry_points={
        "console_scripts": ["tokenomics=tokenomics.tokenomics:calculate_cost"],
    },
)
