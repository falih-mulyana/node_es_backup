// Dependencies
var elasticsearch = require('elasticsearch');
var fs = require('fs');
// Dependencies --end

// Instantiate new ES object
var client = new elasticsearch.Client({
	// your ES server configuration
    host: 'localhost:9200' // todo: make this line a config
});

// some attributes
var keys = [];
var tempData = [];
var indexCounter = 0;

// first get all the mapping
client.indices.getMapping({}, function(e, r){
	if(!e){
		var mappingStr = JSON.stringify(r);
		fs.writeFile('mapping.txt', mappingStr, function (err) {
	  		if (err) return console.log(err);
	  		console.log('mapping info saved to mapping.txt');

	  		// action 2, get all the data

	  		// get all the indexes from previous query
	  		keys = Object.keys(r);
	  		console.log("indexes:");
	  		console.log(keys);

	  		// prepare buffer
	  		fs.writeFile('data.txt', '', function (err) {
		  		if (err) return console.log(err);
		  		// begin to index
		  		searchData();
			});
		});
	}
});

function searchData(){
	console.log("now searching for " + keys[indexCounter]);
	client.search({
		index: keys[indexCounter],
		scroll: '30s',
		retryOnConflict: '10'
	}, function(e,r){
		if(!e){
			postQuery(r);
		}
	});
}

function scrollData(_scroll_id){
	client.scroll({
  		scrollId: _scroll_id,
  		scroll: '30s'
    }, function(e,r){
    	if(!e){
    		postQuery(r);
    	}
    });
}

function postQuery(r){
	if(r.hits.hits.length > 0){
		insertToFile(r);
	} else {
		// next index if any
		if(indexCounter < keys.length-1){
			indexCounter++;
			searchData();
		}
	}
}

function insertToFile(r){
	for(i=0; i<r.hits.hits.length; i++){
		// select index and type
        tempData.push({
            index: {
                _index  : r.hits.hits[i]._index,
                _type   : r.hits.hits[i]._type,
                _id     : r.hits.hits[i]._id ,

            }
        });
        // the document to index
        tempData.push(r.hits.hits[i]._source);
	}

	fs.appendFile('data.txt', JSON.stringify(tempData), function (err) {
		if (err) return console.log(err);
		
		tempData = [];
		// next scroll
    	scrollData(r._scroll_id);
	});

}
