#!/bin/bash
curl -vv -XPOST -d "{\"search\": \"Tempo\"}" http://localhost:4000/api/companies/search
