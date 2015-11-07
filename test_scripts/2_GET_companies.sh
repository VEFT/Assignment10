#2/bin/bash
curl -vv -XGET http://localhost:4000/api/companies\?page\=$1\&max\=$2 | python -m json.tool
