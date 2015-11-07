#1/bin/bash
curl -vv -XDELETE http://localhost:4000/api/companies/$1 | python -m json.tool
