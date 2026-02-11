import * as mc from "@minecraft/server";
export class ChatOptions {
	/*
	/dimension: dimension.id,
	/name: player.name,
	/time: new Date().toString(),
	/constant: String,
	/team: team.name,
	/health: health
*/
	static chatFormatKeyWords = [
		{
			key: "dimensionID",
			hasArg: false,
			value: (player)=>{
				return player.dimension.id;
			}
		},
		{
			key: "name",
			hasArg: false,
			value: (player)=>{
				return player.name;
			}
		},
		{
			key: "time",
			hasArg: false,
			value: (player)=>{
				return new Date().toString();
			}
		},
		{
			key: "health",
			hasArg: false,
			value: (player)=>{
				return player.getComponent("minecraft:health").currentValue;
			}
		},
		{
			key: "message",
			hasArg: false,
			value: (player, message)=>{
				return message;
			}
		},
		{
			key: 'n',
			hasArg: false,
			value: (player)=>{
				return '\n';
			}
		}
	];
	static transForm(message, player){
		let retValue = player.getDynamicProperty("usf:chat_format");
		retValue = JSON.parse(retValue !== undefined ? retValue : mc.world.getDynamicProperty("usf:chatSettings.defaultHeader"));
		for(let item of ChatOptions.chatFormatKeyWords){
			//有参数的标签处理（貌似没必要，停止开发）
			if(item.hasArg === true){
				let matchList = retValue.match(RegExp("/" + item.key + "<.*?>", "g"));
				
			} else if(retValue.includes("/" + item.key)) {
				retValue = retValue.replaceAll("/" + item.key, item.value(player, message));
			}
		};
		return retValue;
	}
}