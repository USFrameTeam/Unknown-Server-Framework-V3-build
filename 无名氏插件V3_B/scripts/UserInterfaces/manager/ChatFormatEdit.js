import {
	ScriptUI
} from "../../utils/UIAPI.js";
import {
	UIManager
} from "../init.js";
import * as mc from "@minecraft/server";
//头衔设置
class ChatFormatEditGUI extends ScriptUI.ModalFormData {
	static typeId = "Manager_ChatFormatEditGUI";
	constructor() {
		super();
		this.setTitle("聊天格式编辑");
		this.setButtonsArray([{
			typeId: "dropdown",
			label: "选择",
			setting: {
				items: [
					"默认聊天格式",
					"玩家聊天格式"
				]
			},
			id: "selectEdit"
		}]);
		this.setBeforeSendEvents((player, ui)=>{
			ui.setFather(new(UIManager.getUI("ManagerGUI"))(player));
		});
		this.setEvents((player, result)=>{
			switch(result.get("selectEdit")){
				case 0: {
					new EditChatGUI().sendToPlayer(player);
				};
				break;
				case 1: {
					new PlayerList().sendToPlayer(player);
				};
				break;
			}
		});
	}
};

mc.system.run(() => {
	UIManager.addUI(ChatFormatEditGUI);
});
//玩家列表

class PlayerList extends ScriptUI.ActionFormData {
	constructor(){
		super();
		this.setTitle("选择玩家");
		this.setFather(new ChatFormatEditGUI());
		for(let player of mc.world.getAllPlayers()){
			this.addButton({
				buttonDef: {
					text: player.name
				},
				event: (manager)=>{
					new EditChatGUI(player).sendToPlayer(manager);
				}
			});
		}
	}
}

//文本编辑
class EditChatGUI extends ScriptUI.ModalFormData {
	constructor(player = null){
		super();
		this.setTitle("聊天格式编辑" + (player !== null ? "[玩家]" : "[默认]"));
		this.setButtonsArray([{
			typeId: "textField",
			label: "聊天格式",
			id: "chat_format",
			setting: {
				defaultValue: JSON.parse(player !== null ? (player.getDynamicProperty("usf:chat_format") ? player.getDynamicProperty("usf:chat_format") : mc.world.getDynamicProperty("usf:chatSettings.defaultHeader")) : mc.world.getDynamicProperty("usf:chatSettings.defaultHeader"))
			}
		}]);
		this.setEvents((player, result)=>{
			if(player !== null){
				player.setDynamicProperty("usf:chat_format", JSON.stringify(result.get("chat_format")));
			} else {
				mc.world.setDynamicProperty("usf:chatSettings.defaultHeader", JSON.stringify(result.get("chat_format")));
			}
		});
	}
}