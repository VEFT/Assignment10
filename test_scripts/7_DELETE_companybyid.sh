#1/bin/bash
curl -vv -XDELETE -H "Content-Type: application/json" -H "ADMIN_TOKEN: admintoken" http://localhost:4000/api/companies/$1 | python -m json.tool
