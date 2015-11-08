#!/bin/bash
curl -vv -XPOST -d "{\"title\": \"Solid Clouds\", \"description\": \"One of the greatest game developement company in the industry. Have recently signed up with the Moddarar which only means on thing... better product.\", \"url\": \"www.sq.is\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies
