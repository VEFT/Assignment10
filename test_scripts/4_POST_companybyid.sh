#1/bin/bash
curl -vv -XPOST -d "{\"title\": \"Lempo\", \"description\": \"Creates a bunch of shiz\", \"url\": \"www.flot.nepal\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies/$1
