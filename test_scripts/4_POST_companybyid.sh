#1/bin/bash
curl -vv -XPOST -d "{\"title\": \"Nexus\", \"description\": \"Creates a bunch of software shiz\", \"url\": \"www.tempo.nepal\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies/$1
