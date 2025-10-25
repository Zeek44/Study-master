#!/usr/bin/env python3

import uvicorn
import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    uvicorn.run(
        "backend.app:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )