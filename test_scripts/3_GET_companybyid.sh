#1/bin/bash
curl -vv -XGET http://localhost:4000/api/companies/$1 | python -m json.tool
