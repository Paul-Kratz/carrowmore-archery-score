#!/bin/bash
# Quick cleanup script - calls the API endpoint to clean up orphaned records

echo "Cleaning up orphaned records..."
curl -X POST http://localhost:3000/api/cleanup
echo ""
echo "Done!"
