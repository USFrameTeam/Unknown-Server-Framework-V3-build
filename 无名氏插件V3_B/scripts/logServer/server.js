import {
	Log
} from "../API/API.js";

/*
	jsonData: {
		filePath: String,
		data: String,
		fileName
	}
*/
let logServer = true;

export function sendLog(jsonData) {
	if(!logServer)return;
	import("@minecraft/server-net").then((logServer) => {
		let request = new logServer.HttpRequest("http://127.0.0.1:1024/");
		//request.setBody(message);
		//request.addHeader("Content-Type", "application/json");
		request.addHeader("neousf", JSON.stringify(jsonData));
		request.setTimeout(2);
		request.setMethod("Get");
		logServer.http.request(request).then(data =>{
			Log.log(JSON.stringify(data));
		}).catch(error => {
			logServer = false;
			//Log.log(error);
		});
		
	}).catch(error => {
		logServer = false;
		Log.log(error);
	});
}