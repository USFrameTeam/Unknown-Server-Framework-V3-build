import {
	ScriptUI
} from "../../utils/UIAPI.js";
import {
	USFPlayer
} from "../../utils/PlayerAPI.js";
import {
	UIManager
} from "../init.js";
import * as mc from "@minecraft/server";

mc.system.run(() => {
	UIManager.addUI(SubordinateManagerGUI);
});

class SubordinateManagerGUI extends ScriptUI.ActionFormData {
	static typeId = "Manager_SubordinateManagerGUI";
	constructor(player) {
		super();
		let managerList = USFPlayer.managerAPI.getList();
		this.setTitle("管理员管理");
		this.setFather(new(UIManager.getUI("ManagerGUI"))(player));
		//this.setInformation(`管理员数量：${managerList.length}`);
		this.addButton({
			buttonDef: {
				text: "添加管理员"
			},
			event: (player) => {
				new SubordinateManagerAddGUI().sendToPlayer(player);
			}
		});
		for (let subordinateManagerID in managerList) {
			if(managerList[subordinateManagerID].level === 2)continue;
			this.addButton({
				buttonDef: {
					text: managerList[subordinateManagerID].name
				},
				event: (op) => {
					new ManagerPermissionsEditGUI(subordinateManagerID).sendToPlayer(op);
				}
			});
		};
	}
};

class SubordinateManagerAddGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("添加管理员");
		let managerList = USFPlayer.managerAPI.getList();
		for (let player of mc.world.getAllPlayers()) {
			if (managerList[USFPlayer.getId(player)]) continue;
			this.addButton({
				buttonDef: {
					text: player.name
				},
				event: (op) => {
					new ManagerPermissionsEditGUI(USFPlayer.getId(player), player.name).sendToPlayer(op);
				}
			});
		}
	}
}

class ManagerPermissionsEditGUI extends ScriptUI.ModalFormData {
	constructor(playerId, playerName = "") {
		super();
		let playerPermissions = USFPlayer.managerAPI.getPermissionFromID(playerId);
		playerPermissions = playerPermissions ? playerPermissions : {};
		this.setTitle("编辑管理员");
		this.setInformation(`管理员名称：${USFPlayer.managerAPI.getList()[playerId] ? USFPlayer.managerAPI.getList()[playerId].name : playerName }`);
		for (let permission in ManagerPermissions) {
			this.addButton({
				typeId: "toggle",
				label: ManagerPermissions[permission],
				id: permission,
				setting: {
					defaultValue: !!playerPermissions[permission]
				}
			});
		};
		this.addButton({
			typeId: "toggle",
			label: "删除管理",
			id: "manager_delete",
			setting: {
				defaultValue: false
			}
		});
		this.setEvents((player, result) => {
			if(result.get("manager_delete") === true){
				USFPlayer.managerAPI.setLevelFromID(playerId, 0);
				return;
			};
			for (let permission in ManagerPermissions) {
				playerPermissions[permission] = result.get(permission);
			};
			USFPlayer.managerAPI.setLevelFromID(playerId, 1, playerName);
			USFPlayer.managerAPI.setPermissionFromID(playerId, playerPermissions);
		});
	}
}

const ManagerPermissions = {
	"scoreboard": "计分板管理",
	"land": "领地管理",
	"customUI": "自定义ui管理",
	"itemEdit": "物品编辑",
	"chatFormat": "聊天格式编辑",
	"teleportSetting": "传送系统设置"
};