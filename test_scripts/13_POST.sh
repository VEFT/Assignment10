#!/bin/bash
curl -vv -XPOST -d "{\"title\": \"Applicon\", \"description\": \"Located inside Nyherji.\", \"url\": \"www.applicon.is\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies
