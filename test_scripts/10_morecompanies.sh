#!/bin/bash
curl -vv -XPOST -d "{\"title\": \"Nyherji\", \"description\": \"One of the milestones in the software architacture in Iceland.\", \"url\": \"www.n.is\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies
