import {
	Log
} from "../utils/API.js";

/*
	jsonData: {
		type: "Log" / "Message"
		data: String,
		//选log要填
		filePath: String,
		fileName: String
	}
*/
var logServerOpen = true;
let logTip = true;
export function sendLog(jsonData) {
	if (!logServerOpen) {
		return;
	};
	jsonData.data = `[${new Date().toString()}]: ` + jsonData.data;
	import("@minecraft/server-net").then((logServer) => {
		if (!logServerOpen) {
			return;
		}
		if (logTip) {
			Log.log("[NeoUSF]--日志服务器可用");
			logTip = false;
		};
		let request = new logServer.HttpRequest("http://127.0.0.1:1024/");
		//request.setBody(message);
		//request.addHeader("Content-Type", "application/json");
		request.addHeader("neousf", JSON.stringify(jsonData));
		request.setTimeout(40);
		request.setMethod("Get");
		logServer.http.request(request).then(data => {
			//Log.log(JSON.stringify(data.headers));
		}).catch(error => {
			logServerOpen = false;
			Log.log(error);
			Log.log("遇到错误，日志服务器已关闭");
		});

	}).catch(error => {
		Log.log("[NeoUSF]--日志服务器不可用\n输入reload指令后重新检测");
		logServerOpen = false;
		Log.log(error);
	});
};

/*import("@minecraft/server-net").then((dataPacket) => {
	dataPacket.beforeEvents.packetReceive.subscribe((packet) => {
		packet.cancel = true;
		if(packet.packetId == "InteractPacket"){
			
		}
		Log.log(JSON.stringify(packet));
	}, {ignoredPacketIds: ["PlayerAuthInputPacket", "SubChunkRequestPacket", "ClientCacheBlobStatusPacket"]});
}).catch(error => {
	Log.log("[NeoUSF]--日志服务器不可用\n输入reload指令后重新检测");
	logServerOpen = false;
	Log.log(error);
});*/