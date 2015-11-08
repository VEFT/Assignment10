#!/bin/bash
curl -vv -XPOST -d "{\"search\": \"tempo\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies/search | python -m json.tool
