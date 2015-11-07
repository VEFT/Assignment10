#!/bin/bash
curl -vv -XPOST -d "{\"title\": \"Tempo\", \"description\": \"Creates a bunch of software shiz\", \"url\": \"www.tempo.is\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies
