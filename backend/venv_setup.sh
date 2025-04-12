#!/bin/bash

# Create a new virtual environment named "venv"
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install the packages listed in the requirements.txt file
pip install -r requirements.txt

# Deactivate the virtual environment
#deactivate

#source venv/bin/activate
