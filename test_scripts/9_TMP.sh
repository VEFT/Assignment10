#!/bin/bash
curl -vv -XPOST http://localhost:4000/api/companies/lol | python -m json.tool
