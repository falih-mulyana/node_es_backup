# Elasticsearch Backup Script
A script to backup Elasticsearch data with node.js

this script generates two file, `mapping.txt` for mapping information and `data.txt` for the data itself.

**What to config?**

i hardcoded ES host configuration in the script, in the ES object initialitation. The default is `host: 'localhost:9200'`. Please change this to fit your ES configuration.

Just run the `index.js` and the two .txt files will be generated.
