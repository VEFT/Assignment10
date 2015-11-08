#!/bin/bash
curl -vv -XPOST -d "{\"title\": \"Raforninn\", \"description\": \"One shitty company. But the MMM has recently picked them a little bit up. They did take a hard fall when JJM declined them.\", \"url\": \"www.orninn.is\"}" -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies
