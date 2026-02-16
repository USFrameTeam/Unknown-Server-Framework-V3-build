import {
	ScriptUI
} from "../utils/UIAPI.js";
import {
	UIManager
} from "./init.js";
import {
  USFPlayer
} from "../utils/PlayerAPI.js";
import {
	TexturePath
} from "./TexturePath.js";
import * as mc from "@minecraft/server";

class MainInterface extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("主菜单");
		this.setInformation();
		this.setButtonsArray([{
				buttonDef: {
					text: "传送",
					iconPath: TexturePath.mainGUI.pointer
				},
				condition: (player) => {
					return true;
				},
				event: (player) => {
					new(UIManager.getUI("teleportGUI"))().sendToPlayer(player);
				}
			},
			{
				buttonDef: {
					text: "聊天设置",
					iconPath: TexturePath.mainGUI.message
				},
				condition: (player) => {
					return false;
				},
				event: (player) => {
					
				}
			},
			/*{
				buttonDef: {
					text: "队伍",
					iconPath: TexturePath.mainGUI.FriendsIcon
				},
				event: (player)=>{
					
				}
			},*/
			{
				buttonDef: {
					text: "领地",
					iconPath: TexturePath.mainGUI.icon_new
				},
				condition: (player) => {
					return JSON.parse(mc.world.getDynamicProperty("usf:landOptions.enable"));
				},
				event: (player) => {
					new(UIManager.getUI("LandGUI"))().sendToPlayer(player);
				}
			},
			{
				buttonDef: {
					text: "自杀",
					iconPath: TexturePath.mainGUI.sword
				},
				/*condition: (player) => {
					return true;
				},*/
				event: (player) => {
					player.kill();
				}
			},
			{
				buttonDef: {
					text: "管理界面",
					iconPath: TexturePath.mainGUI.permissions_op_crown
				},
				condition: (player) => {
					if (USFPlayer.managerAPI.getLevelFromPlayer(player) > 0) {
						return true;
					};
					return false;
				},
				event: (player) => {
					new(UIManager.getUI("ManagerGUI"))(player).sendToPlayer(player);
				}
			},
			{
				buttonDef: {
					text: "测试"
				},
				condition: (player) => {
					return false;
				},
				event: (player) => {
					new(UIManager.getUI("developUI"))().sendToPlayer(player);
				}
			}
		]);
		
		this.setBeforeSendEvents((player, ui) => {
			//修sb ojang的键鼠bug
			if (Date.now() - (player?.openTime ? player.openTime : 0) < 1000) {
				ui.cancel = true;
				return;
			};
			player.openTime = Date.now();


			if (player?.land?.create) {
				if (player.isSneaking) {
					delete player.land;
				} else {
					if (player?.land?.pos.length >= 2) {
						new(UIManager.getUI("LandGUI").addLandGUI())().sendToPlayer(player);
						ui.cancel = true;
					}
				}
			}
		});
	};
	static typeId = "mainGUI";
};

mc.system.run(() => {
	UIManager.addUI(MainInterface);
});